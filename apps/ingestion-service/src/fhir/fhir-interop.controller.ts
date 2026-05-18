import {
  Controller, Post, Get, Param, Body, Query,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { FhirInteropService } from './fhir-interop.service';

/**
 * Generic FHIR R4 Interoperability Controller.
 *
 * Exposes a RESTful FHIR interface:
 *   GET  /fhir/metadata              → CapabilityStatement
 *   POST /fhir/:resourceType         → Create a FHIR resource
 *   GET  /fhir/:resourceType         → Search resources (with FHIR params)
 *   GET  /fhir/:resourceType/:id     → Read a single resource
 *
 * All routes are public (no JWT) to allow interoperability with
 * external systems (hospitals, labs, medical devices).
 */
@ApiTags('FHIR Interoperability')
@Public()
@Controller('fhir')
export class FhirInteropController {
  constructor(private readonly fhirService: FhirInteropService) {}

  @ApiOperation({
    summary: 'FHIR CapabilityStatement (metadata)',
    description:
      'Returns the server CapabilityStatement describing supported ' +
      'resource types, interactions, and search parameters.',
  })
  @ApiResponse({ status: 200, description: 'CapabilityStatement returned' })
  @Get('metadata')
  getMetadata() {
    return this.fhirService.getCapabilityStatement();
  }

  @ApiOperation({
    summary: 'Create a FHIR R4 resource',
    description:
      'Accepts any supported FHIR R4 resource as the request body. ' +
      'Validates required fields and stores the resource in JSONB.',
  })
  @ApiParam({
    name: 'resourceType',
    description: 'FHIR resource type (e.g. Patient, Observation, Condition)',
    example: 'Observation',
  })
  @ApiResponse({ status: 201, description: 'Resource created and stored' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @HttpCode(HttpStatus.CREATED)
  @Post(':resourceType')
  async createResource(
    @Param('resourceType') resourceType: string,
    @Body() body: any,
  ) {
    if (resourceType === 'Bundle') {
      return this.fhirService.processBundle(body);
    }
    return this.fhirService.createResource(resourceType, body);
  }

  @ApiOperation({
    summary: 'Search FHIR resources',
    description:
      'Search resources by type with optional FHIR search parameters. ' +
      'Returns a FHIR Bundle (searchset).',
  })
  @ApiParam({
    name: 'resourceType',
    description: 'FHIR resource type to search',
    example: 'Condition',
  })
  @ApiQuery({ name: 'name', required: false, description: 'Patient name (partial match)' })
  @ApiQuery({ name: 'patient', required: false, description: 'Patient reference (e.g. urn:uuid:xxx)' })
  @ApiQuery({ name: 'code', required: false, description: 'Clinical code (SNOMED/LOINC)' })
  @ApiQuery({ name: 'status', required: false, description: 'Resource status' })
  @ApiQuery({ name: '_count', required: false, description: 'Max results (default: 100, max: 500)' })
  @Get(':resourceType')
  async searchResources(
    @Param('resourceType') resourceType: string,
    @Query() query: Record<string, string>,
  ) {
    return this.fhirService.searchResources(resourceType, query);
  }

  @ApiOperation({
    summary: 'Read a single FHIR resource by ID',
    description: 'Retrieves a specific FHIR resource by its internal database ID.',
  })
  @ApiParam({ name: 'resourceType', example: 'Patient' })
  @ApiParam({ name: 'id', description: 'Internal resource ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Resource found' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @Get(':resourceType/:id')
  async readResource(
    @Param('resourceType') resourceType: string,
    @Param('id') id: string,
  ) {
    return this.fhirService.readResource(resourceType, id);
  }
}
