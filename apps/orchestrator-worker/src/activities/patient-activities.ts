/**
 * Activities — Les actions concrètes du workflow d'admission d'urgence.
 *
 * Chaque activité fait un appel HTTP vers l'ingestion-service (NestJS).
 * En cas d'échec, Temporal gère automatiquement les retries
 * sans que le développeur n'ait à écrire un seul try/catch.
 */
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.INGESTION_SERVICE_URL || 'http://localhost:3000';

// ─── Token JWT cache (pour ne pas se re-connecter à chaque appel) ───
let cachedToken: string | null = null;

async function getAuthenticatedClient(): Promise<AxiosInstance> {
  if (!cachedToken) {
    console.log('🔑 [Auth] Connexion en tant qu\'admin pour obtenir un token...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@smarthealth.com',
      password: 'Admin123!',
    });
    cachedToken = loginResponse.data.access_token;
    console.log('✅ [Auth] Token obtenu !');
  }

  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${cachedToken}` },
  });
}

// ─── Interfaces ──────────────────────────────────────────
export interface EmergencyPatientInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  reason: string;
}

export interface WorkflowResult {
  patientId: string;
  practitionerId: string;
  appointmentId: string;
  status: string;
}

// ─── Activity 1 : Créer le patient (Relationnel) ───────────
export async function createEmergencyFhirPatient(
  input: EmergencyPatientInput,
): Promise<string> {
  console.log(`🏥 [Activity] Création du dossier Patient pour ${input.firstName} ${input.lastName}...`);

  const client = await getAuthenticatedClient();

  const patientData = {
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender,
    birthDate: input.birthDate,
  };

  const response = await client.post('/patients', patientData);
  const patientId = response.data.id;

  console.log(`✅ [Activity] Patient créé — ID: ${patientId}`);
  return patientId;
}

// ─── Activity 2 : Trouver le praticien de garde ──────────
export async function assignOnCallPractitioner(): Promise<string> {
  console.log(`👨‍⚕️ [Activity] Recherche du praticien de garde...`);

  const client = await getAuthenticatedClient();
  const response = await client.get('/practitioners');
  const practitioners = response.data;

  if (!practitioners || practitioners.length === 0) {
    throw new Error('Aucun praticien disponible ! Escalade nécessaire.');
  }

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

  const client = await getAuthenticatedClient();
  const appointmentData = {
    patientId,
    practitionerId,
    dateTime: new Date().toISOString(),
    status: 'EMERGENCY',
    reason: 'Admission urgence — Workflow Temporal',
  };

  console.log(`   📦 Données envoyées :`, JSON.stringify(appointmentData, null, 2));

  try {
    const response = await client.post('/appointments', appointmentData);
    const appointmentId = response.data.id;
    console.log(`✅ [Activity] Rendez-vous d'urgence créé — ID: ${appointmentId}`);
    return appointmentId;
  } catch (err: any) {
    console.error(`❌ [Activity] Erreur HTTP ${err.response?.status} :`, JSON.stringify(err.response?.data));
    throw err;
  }
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

  // En production : email, SMS, ou push notification.
  // Pour le MVP : log structuré.
  console.log(`✅ [Activity] Praticien notifié avec succès !`);
}
