/**
 * Activities — Les actions concrètes du workflow d'admission d'urgence.
 *
 * Chaque activité fait un appel HTTP vers l'ingestion-service (NestJS).
 * En cas d'échec, Temporal gère automatiquement les retries
 * sans que le développeur n'ait à écrire un seul try/catch.
 */
import axios from 'axios';

const API_URL = process.env.INGESTION_SERVICE_URL || 'http://localhost:3000';

// ─── Interfaces ──────────────────────────────────────────
export interface EmergencyPatientInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  reason: string;   // Motif d'admission d'urgence
}

export interface WorkflowResult {
  patientId: string;
  practitionerId: string;
  appointmentId: string;
  status: string;
}

// ─── Activity 1 : Créer le patient FHIR ──────────────────
export async function createEmergencyFhirPatient(
  input: EmergencyPatientInput,
): Promise<string> {
  console.log(`🏥 [Activity] Création du dossier FHIR pour ${input.firstName} ${input.lastName}...`);

  const fhirPatient = {
    resourceType: 'Patient',
    name: [{ family: input.lastName, given: [input.firstName] }],
    gender: input.gender,
    birthDate: input.birthDate,
    extension: [
      {
        url: 'http://smarthealth.local/emergency-reason',
        valueString: input.reason,
      },
    ],
  };

  const response = await axios.post(`${API_URL}/fhir/Patient`, fhirPatient);
  const patientId = response.data.id;

  console.log(`✅ [Activity] Patient FHIR créé — ID: ${patientId}`);
  return patientId;
}

// ─── Activity 2 : Trouver le praticien de garde ──────────
export async function assignOnCallPractitioner(): Promise<string> {
  console.log(`👨‍⚕️ [Activity] Recherche du praticien de garde...`);

  // En production : on interrogerait une table de planning.
  // Pour le MVP, on prend le premier praticien disponible.
  const response = await axios.get(`${API_URL}/practitioners`);
  const practitioners = response.data;

  if (!practitioners || practitioners.length === 0) {
    throw new Error('Aucun praticien disponible ! Escalade nécessaire.');
  }

  // Sélection round-robin simplifiée (premier praticien trouvé)
  const assigned = practitioners[0];
  console.log(`✅ [Activity] Praticien assigné : ${assigned.firstName} ${assigned.lastName} (${assigned.id})`);
  return assigned.id;
}

// ─── Activity 3 : Créer le rendez-vous d'urgence ─────────
export async function createEmergencyAppointment(
  patientId: string,
  practitionerId: string,
): Promise<string> {
  console.log(`📅 [Activity] Création du rendez-vous d'urgence...`);

  const appointmentData = {
    patientId,
    practitionerId,
    dateTime: new Date().toISOString(),
    status: 'EMERGENCY',
    reason: 'Admission urgence — Workflow Temporal',
  };

  const response = await axios.post(`${API_URL}/appointments`, appointmentData);
  const appointmentId = response.data.id;

  console.log(`✅ [Activity] Rendez-vous d'urgence créé — ID: ${appointmentId}`);
  return appointmentId;
}

// ─── Activity 4 : Notifier le praticien ──────────────────
export async function notifyPractitioner(
  practitionerId: string,
  patientId: string,
  appointmentId: string,
): Promise<void> {
  console.log(`🔔 [Activity] Notification du praticien ${practitionerId}...`);
  console.log(`   → Patient: ${patientId}`);
  console.log(`   → Rendez-vous: ${appointmentId}`);

  // En production : on enverrait un email, un SMS, ou un push notification.
  // Pour le MVP, on émet un log structuré qui sera capté par le monitoring.
  console.log(`✅ [Activity] Praticien notifié avec succès !`);
}
