/**
 * Emergency Admission Workflow — SmartHealth
 *
 * Purely deterministic (Temporal requirement).
 * Orchestrates the execution order of Activities only.
 * On crash, Temporal resumes at the exact step via Event Sourcing.
 */
import { proxyActivities, sleep, log } from '@temporalio/workflow';
import type * as activities from '../activities/patient-activities';

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

export interface EmergencyAdmissionInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  reason: string;
}

export async function emergencyAdmissionWorkflow(
  input: EmergencyAdmissionInput,
): Promise<{
  patientId: string;
  practitionerId: string;
  appointmentId: string;
  status: string;
}> {
  log.info('WORKFLOW STARTED: Emergency admission', { patient: `${input.firstName} ${input.lastName}` });

  log.info('Step 1/4: Creating FHIR patient record...');
  const patientId = await createEmergencyFhirPatient(input);

  log.info('Step 2/4: Assigning on-call practitioner...');
  const practitionerId = await assignOnCallPractitioner();

  log.info('Step 3/4: Creating emergency appointment...');
  const appointmentId = await createEmergencyAppointment(patientId, practitionerId);

  log.info('Step 4/4: Notifying practitioner...');
  await notifyPractitioner(practitionerId, patientId, appointmentId);

  await sleep('5 seconds');

  log.info('WORKFLOW COMPLETED: Patient admitted successfully!');

  return {
    patientId,
    practitionerId,
    appointmentId,
    status: 'ADMITTED',
  };
}
