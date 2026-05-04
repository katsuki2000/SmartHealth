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

  // ─── FLUX 2 : Relational CRUD (Avec Isolation) ───────────────────
  async create(data: CreatePatientDto, userId: string, role: string) {
    let practitionerId: string | undefined = undefined;
    if (role === 'DOCTOR') {
      const practitioner = await this.prisma.practitioner.findUnique({ where: { userId } });
      if (practitioner) practitionerId = practitioner.id;
    }

    const newPatient = await this.prisma.patient.create({
      data: {
        ...data,
        birthDate: new Date(data.birthDate),
        practitionerId,
      },
    });
    this.eventEmitter.emitPatientCreated(newPatient).catch(() => {});
    return newPatient;
  }

  async findAll(userId: string, role: string) {
    // Un Admin voit tout le monde
    if (role === 'ADMIN') {
      return this.prisma.patient.findMany();
    }
    
    // Un docteur ne voit que ses propres patients
    const practitioner = await this.prisma.practitioner.findUnique({ where: { userId } });
    if (!practitioner) return [];

    return this.prisma.patient.findMany({
      where: { practitionerId: practitioner.id }
    });
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

  // ─── FLUX 3 : Break The Glass (Urgence) ─────────────────────
  async emergencyAccess(patientId: string, userId: string, reason: string) {
    const practitioner = await this.prisma.practitioner.findUnique({ where: { userId } });
    if (!practitioner) {
      throw new BadRequestException('Seul un médecin peut utiliser l\'accès d\'urgence');
    }

    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Enregistrer le log d'audit obligatoirement avant de retourner les données
    await this.prisma.accessLog.create({
      data: {
        practitionerId: practitioner.id,
        patientId: patient.id,
        reason,
      }
    });

    this.logger.warn(`⚠️ EMERGENCY ACCESS: Practitioner ${practitioner.id} accessed Patient ${patient.id}. Reason: ${reason}`);

    return patient;
  }
}