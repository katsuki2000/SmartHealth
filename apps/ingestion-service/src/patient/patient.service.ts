import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './create-patient.dto';
import { FhirPatientDto } from './fhir-patient.dto';
import { EventEmitterService } from '../common/services/event-emitter.service';

/**
 * PatientService — deux flux de données distincts :
 *
 * 1. FHIR-Native  → POST /api/v1/fhir/Patient
 *    Le body EST le JSON FHIR R4 brut (standard HL7 FHIR R4).
 *    Accepte toute source : hôpital, laboratoire, appareil médical, dataset de recherche.
 *    Stocké tel quel en JSONB dans la table `fhir_resources`.
 *    Émet fhir.patient.created sur RabbitMQ.
 *
 * 2. Relational CRUD → POST /api/v1/patients
 *    Crée un enregistrement dans la table `Patient` relationnelle.
 *    Émet patient.created sur RabbitMQ.
 */
@Injectable()
export class PatientService {
  private readonly logger = new Logger(PatientService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  // ─── FLUX 1 : FHIR-Native (JSONB) ─────────────────────────
  async createFhirPatient(body: FhirPatientDto) {
    if (body.resourceType !== 'Patient') {
      throw new BadRequestException(
        `Expected resourceType "Patient", received "${body.resourceType}"`,
      );
    }

    const resource = await this.prisma.fhirResource.create({
      data: {
        resourceType: 'Patient',
        content: body as any,
      },
    });

    this.logger.log(`✅ FHIR Patient stored — internal id: ${resource.id}`);

    this.eventEmitter
      .emitFhirResourceCreated({ id: resource.id, resourceType: 'Patient' })
      .catch((err) => this.logger.warn(`RabbitMQ skip: ${err.message}`));

    return resource;
  }

  async findAllFhirPatients() {
    return this.prisma.fhirResource.findMany({
      where: { resourceType: 'Patient' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFhirPatient(id: string) {
    const resource = await this.prisma.fhirResource.findFirst({
      where: { id, resourceType: 'Patient' },
    });
    if (!resource) {
      throw new NotFoundException(`FHIR Patient with ID ${id} not found`);
    }
    return resource;
  }

  // ─── FLUX 2 : Relational CRUD ──────────────────────────────
  async create(data: CreatePatientDto) {
    const newPatient = await this.prisma.patient.create({
      data: {
        ...data,
        birthDate: new Date(data.birthDate),
      },
    });
    this.eventEmitter.emitPatientCreated(newPatient).catch(() => {});
    return newPatient;
  }

  async findAll() {
    return this.prisma.patient.findMany();
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async update(id: string, data: Partial<CreatePatientDto>) {
    try {
      const updated = await this.prisma.patient.update({
        where: { id },
        data: {
          ...data,
          ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
        },
      });
      this.eventEmitter.emitPatientUpdated(updated).catch(() => {});
      return updated;
    } catch {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.patient.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
  }
}