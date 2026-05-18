/**
 * Activities — Concrete actions of the emergency admission workflow.
 *
 * Each activity makes an HTTP call to the ingestion-service (NestJS).
 * On failure, Temporal handles retries automatically.
 */
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.INGESTION_SERVICE_URL || 'http://localhost:3000';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@smarthealth.com';
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminPassword) {
  throw new Error('ADMIN_PASSWORD is required for orchestrator worker');
}

let cachedToken: string | null = null;

async function getAuthenticatedClient(): Promise<AxiosInstance> {
  if (!cachedToken) {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    });
    cachedToken = loginResponse.data.access_token;
  }

  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${cachedToken}` },
  });
}

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

export async function createEmergencyFhirPatient(
  input: EmergencyPatientInput,
): Promise<string> {
  const client = await getAuthenticatedClient();

  const patientData = {
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender,
    birthDate: input.birthDate,
  };

  const response = await client.post('/patients', patientData);
  return response.data.id;
}

export async function assignOnCallPractitioner(): Promise<string> {
  const client = await getAuthenticatedClient();
  const response = await client.get('/practitioners');
  const practitioners = response.data;

  if (!practitioners || practitioners.length === 0) {
    throw new Error('No practitioner available. Escalation required.');
  }

  return practitioners[0].id;
}

export async function createEmergencyAppointment(
  patientId: string,
  practitionerId: string,
): Promise<string> {
  const client = await getAuthenticatedClient();

  const appointmentData = {
    patientId,
    practitionerId,
    dateTime: new Date().toISOString(),
    status: 'EMERGENCY',
    reason: 'Emergency admission — Temporal Workflow',
  };

  const response = await client.post('/appointments', appointmentData);
  return response.data.id;
}

export async function notifyPractitioner(
  practitionerId: string,
  patientId: string,
  appointmentId: string,
): Promise<void> {
  console.log(`[Notification] Practitioner ${practitionerId} notified for patient ${patientId}, appointment ${appointmentId}`);
}
