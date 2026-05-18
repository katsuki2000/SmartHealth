/**
 * Temporal Client — SmartHealth
 *
 * Script to manually trigger an emergency admission workflow.
 *
 * Usage: pnpm run start:client
 */
import { Client, Connection } from '@temporalio/client';
import { emergencyAdmissionWorkflow } from './workflows/emergency-admission.workflow';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'smarthealth-emergency';

  const connection = await Connection.connect({ address: temporalAddress });
  const client = new Client({ connection });

  const patientData = {
    firstName: 'Rakoto',
    lastName: 'Jean-Baptiste',
    birthDate: '1985-03-15',
    gender: 'male',
    reason: 'Road accident — Cranial trauma — Emergency admission',
  };

  console.log(`Patient: ${patientData.firstName} ${patientData.lastName}`);
  console.log(`Reason: ${patientData.reason}\n`);

  const handle = await client.workflow.start(emergencyAdmissionWorkflow, {
    taskQueue,
    workflowId: `emergency-${Date.now()}`,
    args: [patientData],
  });

  console.log(`Workflow started (ID: ${handle.workflowId})`);

  const result = await handle.result();

  console.log(`\nWorkflow completed:`);
  console.log(`  Patient ID      : ${result.patientId}`);
  console.log(`  Practitioner ID : ${result.practitionerId}`);
  console.log(`  Appointment ID  : ${result.appointmentId}`);
  console.log(`  Status          : ${result.status}`);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
