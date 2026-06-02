import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitterService } from '../common/services/event-emitter.service';

/**
 * Supported FHIR R4 resource types.
 * This list defines which resources can be ingested and queried.
 */
const SUPPORTED_TYPES = [
  'Patient', 'Observation', 'Condition', 'Encounter',
  'MedicationRequest', 'Practitioner', 'AllergyIntolerance',
  'Procedure', 'Immunization', 'DiagnosticReport',
] as const;

type SupportedType = (typeof SUPPORTED_TYPES)[number];

/**
 * Minimum required fields per resource type.
 * These are checked on ingestion to ensure basic FHIR conformity.
 */
const REQUIRED_FIELDS: Record<string, string[]> = {
  Patient:              ['name'],
  Observation:          ['status', 'code'],
  Condition:            ['code'],
  Encounter:            ['status', 'class'],
  MedicationRequest:    ['status', 'intent'],
  Practitioner:         ['name'],
  AllergyIntolerance:   ['patient', 'code'],
  Procedure:            ['status', 'code', 'subject'],
  Immunization:         ['status', 'vaccineCode', 'patient'],
  DiagnosticReport:     ['status', 'code'],
};

@Injectable()
export class FhirInteropService {
  private readonly logger = new Logger(FhirInteropService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  /**
   * Returns a simplified FHIR CapabilityStatement.
   */
  getCapabilityStatement() {
    return {
      resourceType: 'CapabilityStatement',
      status: 'active',
      date: new Date().toISOString(),
      kind: 'instance',
      software: {
        name: 'SmartHealth',
        version: '1.0.0',
      },
      implementation: {
        description: 'SmartHealth FHIR-first Interoperability Layer',
      },
      fhirVersion: '4.0.1',
      format: ['json'],
      rest: [
        {
          mode: 'server',
          resource: SUPPORTED_TYPES.map((type) => ({
            type,
            interaction: [
              { code: 'read' },
              { code: 'create' },
              { code: 'search-type' },
            ],
            searchParam: this.getSearchParams(type),
          })),
        },
      ],
    };
  }

  /**
   * Validates and stores a FHIR resource.
   */
  async createResource(resourceType: string, body: any) {
    if (!SUPPORTED_TYPES.includes(resourceType as SupportedType)) {
      throw new BadRequestException(
        `Unsupported resourceType "${resourceType}". Supported: ${SUPPORTED_TYPES.join(', ')}`,
      );
    }

    if (body.resourceType !== resourceType) {
      throw new BadRequestException(
        `resourceType mismatch: URL says "${resourceType}" but body says "${body.resourceType}"`,
      );
    }

    // Validate required fields
    const required = REQUIRED_FIELDS[resourceType] || [];
    const missing = required.filter((field) => !body[field]);
    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required FHIR fields for ${resourceType}: ${missing.join(', ')}`,
      );
    }

    const resource = await this.prisma.fhirResource.create({
      data: {
        resourceType,
        content: body,
      },
    });

    this.logger.log(`FHIR ${resourceType} stored — id: ${resource.id}`);

    this.eventEmitter
      .emitFhirResourceCreated({ id: resource.id, resourceType })
      .catch((err) => this.logger.warn(`RabbitMQ skip: ${err.message}`));

    return resource;
  }

  /**
   * Processes a FHIR Bundle (transaction or batch) containing multiple entries.
   * Validates and ingests each entry individually.
   */
  async processBundle(body: any) {
    if (!body || body.resourceType !== 'Bundle') {
      throw new BadRequestException('Resource must be of type Bundle');
    }

    const entries = body.entry || [];
    const results: any[] = [];

    this.logger.log(`Processing FHIR Bundle with ${entries.length} entries...`);

    for (const entry of entries) {
      const resource = entry.resource;
      if (!resource || !resource.resourceType) {
        this.logger.warn('Skipping bundle entry: missing resource or resourceType');
        continue;
      }

      try {
        const created = await this.createResource(resource.resourceType, resource);
        results.push({
          status: '201 Created',
          location: `${resource.resourceType}/${created.id}`,
          resource: created,
        });
      } catch (err: any) {
        this.logger.error(`Failed to ingest resource from bundle: ${err.message}`);
        results.push({
          status: '400 Bad Request',
          message: err.message,
        });
      }
    }

    return {
      resourceType: 'Bundle',
      type: 'batch-response',
      total: results.length,
      entry: results.map((res) => {
        if (res.status === '201 Created') {
          return {
            response: {
              status: res.status,
              location: res.location,
            },
            resource: (res.resource as any).content,
          };
        } else {
          return {
            response: {
              status: res.status,
              outcome: {
                resourceType: 'OperationOutcome',
                issue: [{
                  severity: 'error',
                  code: 'invalid',
                  diagnostics: res.message,
                }],
              },
            },
          };
        }
      }),
    };
  }

  /**
   * Retrieves all resources of a given type, with optional FHIR search parameters.
   */
  async searchResources(resourceType: string, query: Record<string, string>) {
    if (!SUPPORTED_TYPES.includes(resourceType as SupportedType)) {
      throw new BadRequestException(`Unsupported resourceType "${resourceType}"`);
    }

    // Base query: filter by resource type
    let sql = `SELECT id, "resourceType", content, "createdAt" FROM fhir_resources WHERE "resourceType" = $1`;
    const params: any[] = [resourceType];
    let paramIndex = 2;

    // FHIR search parameters mapped to JSONB queries
    if (query.name) {
      sql += ` AND (
        content->>'name' ILIKE $${paramIndex}
        OR content->'name'->0->>'family' ILIKE $${paramIndex}
        OR content->'name'->0->'given'->>0 ILIKE $${paramIndex}
      )`;
      params.push(`%${query.name}%`);
      paramIndex++;
    }

    if (query.patient || query.subject) {
      const patientRef = query.patient || query.subject;
      sql += ` AND (
        content->'subject'->>'reference' ILIKE $${paramIndex}
        OR content->'patient'->>'reference' ILIKE $${paramIndex}
      )`;
      params.push(`%${patientRef}%`);
      paramIndex++;
    }

    if (query.code) {
      sql += ` AND content->'code'->'coding'->0->>'code' = $${paramIndex}`;
      params.push(query.code);
      paramIndex++;
    }

    if (query.status) {
      sql += ` AND content->>'status' = $${paramIndex}`;
      params.push(query.status);
      paramIndex++;
    }

    if (query._count) {
      const limit = Math.min(parseInt(query._count, 10) || 100, 500);
      sql += ` ORDER BY "createdAt" DESC LIMIT ${limit}`;
    } else {
      sql += ` ORDER BY "createdAt" DESC LIMIT 100`;
    }

    const rows: any[] = await this.prisma.$queryRawUnsafe(sql, ...params);

    // Return as a FHIR Bundle (searchset)
    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: rows.length,
      entry: rows.map((row) => ({
        fullUrl: `urn:uuid:${row.id}`,
        resource: row.content,
      })),
    };
  }

  /**
   * Retrieves a single resource by internal ID.
   */
  async readResource(resourceType: string, id: string) {
    if (!SUPPORTED_TYPES.includes(resourceType as SupportedType)) {
      throw new BadRequestException(`Unsupported resourceType "${resourceType}"`);
    }

    const resource = await this.prisma.fhirResource.findFirst({
      where: { id, resourceType },
    });

    if (!resource) {
      throw new NotFoundException(`${resourceType}/${id} not found`);
    }

    return resource;
  }

  /**
   * Returns search parameter definitions for the CapabilityStatement.
   */
  private getSearchParams(type: string) {
    const common = [{ name: '_count', type: 'number' }];

    switch (type) {
      case 'Patient':
        return [...common, { name: 'name', type: 'string' }];
      case 'Observation':
      case 'Condition':
      case 'Encounter':
      case 'Procedure':
        return [
          ...common,
          { name: 'patient', type: 'reference' },
          { name: 'code', type: 'token' },
          { name: 'status', type: 'token' },
        ];
      case 'MedicationRequest':
        return [
          ...common,
          { name: 'patient', type: 'reference' },
          { name: 'status', type: 'token' },
        ];
      default:
        return common;
    }
  }
}
