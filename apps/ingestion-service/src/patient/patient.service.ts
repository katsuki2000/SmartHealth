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

    this.logger.log(`FHIR Patient stored — internal id: ${resource.id}`);

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
      throw new BadRequestException('Only a doctor can use emergency access');
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

  // ─── FLUX 4 : Historique Clinique FHIR (JSONB) ──────────────
  /**
   * Récupère l'historique clinique d'un patient en interrogeant
   * la table JSONB fhir_resources.
   * 
   * Stratégie de liaison :
   * 1. On récupère le patient relationnel (firstName, lastName)
   * 2. On cherche le FHIR Patient correspondant par nom
   * 3. On récupère toutes les ressources liées par subject.reference
   */
  async getClinicalHistory(patientId: string) {
    // 1. Récupérer le patient relationnel
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // 2. Chercher le FHIR Patient correspondant par nom (family + given)
    const fhirPatients = await this.prisma.$queryRaw<any[]>`
      SELECT id, content
      FROM fhir_resources
      WHERE "resourceType" = 'Patient'
        AND content->'name'->0->>'family' = ${patient.lastName}
        AND content->'name'->0->'given'->>0 = ${patient.firstName}
      LIMIT 1
    `;

    if (!fhirPatients || fhirPatients.length === 0) {
      // Pas de correspondance FHIR trouvée — retourne les infos relationnelles uniquement
      return {
        patient,
        fhirLinked: false,
        conditions: [],
        observations: [],
        encounters: [],
        medications: [],
        allergies: [],
      };
    }

    const fhirPatient = fhirPatients[0];
    const fhirPatientId = (fhirPatient.content as any)?.id;

    if (!fhirPatientId) {
      return {
        patient,
        fhirLinked: false,
        conditions: [],
        observations: [],
        encounters: [],
        medications: [],
        allergies: [],
      };
    }

    // 3. Récupérer les ressources liées via subject.reference
    const patientRef = `urn:uuid:${fhirPatientId}`;

    // Conditions (Diagnostics)
    const conditions = await this.prisma.$queryRaw<any[]>`
      SELECT content
      FROM fhir_resources
      WHERE "resourceType" = 'Condition'
        AND content->'subject'->>'reference' = ${patientRef}
      ORDER BY (content->>'onsetDateTime')::text DESC
      LIMIT 50
    `;

    // Observations (Signes vitaux)
    const observations = await this.prisma.$queryRaw<any[]>`
      SELECT content
      FROM fhir_resources
      WHERE "resourceType" = 'Observation'
        AND content->'subject'->>'reference' = ${patientRef}
      ORDER BY (content->>'effectiveDateTime')::text DESC
      LIMIT 50
    `;

    // Encounters (Séjours / Consultations)
    const encounters = await this.prisma.$queryRaw<any[]>`
      SELECT content
      FROM fhir_resources
      WHERE "resourceType" = 'Encounter'
        AND content->'subject'->>'reference' = ${patientRef}
      ORDER BY (content->'period'->>'start')::text DESC
      LIMIT 30
    `;

    // MedicationRequests (Prescriptions)
    const medications = await this.prisma.$queryRaw<any[]>`
      SELECT content
      FROM fhir_resources
      WHERE "resourceType" = 'MedicationRequest'
        AND content->'subject'->>'reference' = ${patientRef}
      ORDER BY (content->>'authoredOn')::text DESC
      LIMIT 30
    `;

    // AllergyIntolerance
    const allergies = await this.prisma.$queryRaw<any[]>`
      SELECT content
      FROM fhir_resources
      WHERE "resourceType" = 'AllergyIntolerance'
        AND content->'patient'->>'reference' = ${patientRef}
      LIMIT 20
    `;

    return {
      patient,
      fhirLinked: true,
      fhirPatientId,
      conditions: conditions.map(r => r.content),
      observations: observations.map(r => r.content),
      encounters: encounters.map(r => r.content),
      medications: medications.map(r => r.content),
      allergies: allergies.map(r => r.content),
    };
  }
}