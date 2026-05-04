/**
 * Workflow d'Admission d'Urgence — SmartHealth
 *
 * Ce fichier est PUREMENT DÉTERMINISTE (exigence Temporal).
 * Il ne fait AUCUN appel réseau, AUCUN accès base de données.
 * Il orchestre uniquement l'ordre d'exécution des Activities.
 *
 * Si le serveur plante au milieu, Temporal reprendra exactement
 * à l'étape où il s'est arrêté grâce au Event Sourcing.
 */
import { proxyActivities, sleep, log } from '@temporalio/workflow';
import type * as activities from '../activities/patient-activities';

// Proxy des activities avec configuration des retries
const {
  createEmergencyFhirPatient,
  assignOnCallPractitioner,
  createEmergencyAppointment,
  notifyPractitioner,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1 second',
    backoffCoefficient: 2,
  },
});

// ─── Interface d'entrée du workflow ──────────────────────
export interface EmergencyAdmissionInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  reason: string;
}

// ─── Le Workflow Principal ───────────────────────────────
export async function emergencyAdmissionWorkflow(
  input: EmergencyAdmissionInput,
): Promise<{
  patientId: string;
  practitionerId: string;
  appointmentId: string;
  status: string;
}> {
  log.info('🚨 WORKFLOW DÉMARRÉ : Admission d\'urgence', { patient: `${input.firstName} ${input.lastName}` });

  // ── Étape 1 : Créer le dossier patient FHIR ──────────
  log.info('📋 Étape 1/4 : Création du dossier FHIR...');
  const patientId = await createEmergencyFhirPatient(input);

  // ── Étape 2 : Assigner un praticien de garde ──────────
  log.info('👨‍⚕️ Étape 2/4 : Recherche du praticien de garde...');
  const practitionerId = await assignOnCallPractitioner();

  // ── Étape 3 : Créer le rendez-vous d'urgence ──────────
  log.info('📅 Étape 3/4 : Création du rendez-vous d\'urgence...');
  const appointmentId = await createEmergencyAppointment(patientId, practitionerId);

  // ── Étape 4 : Notifier le praticien ───────────────────
  log.info('🔔 Étape 4/4 : Notification du praticien...');
  await notifyPractitioner(practitionerId, patientId, appointmentId);

  // ── Délai de confirmation (simulé) ────────────────────
  log.info('⏳ Attente de 5 secondes (simulation de confirmation)...');
  await sleep('5 seconds');

  log.info('✅ WORKFLOW TERMINÉ : Patient admis avec succès !');

  return {
    patientId,
    practitionerId,
    appointmentId,
    status: 'ADMITTED',
  };
}
