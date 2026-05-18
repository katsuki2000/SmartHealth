/**
 * Temporal Worker — SmartHealth
 *
 * Connects to the Temporal server, registers workflows and activities,
 * and listens on the "smarthealth-emergency" task queue.
 *
 * Usage: pnpm run start
 */
import { Worker, NativeConnection } from '@temporalio/worker';
import * as patientActivities from './activities/patient-activities';
import * as analyticsActivities from './activities/analytics-activities';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'smarthealth-emergency';

  console.log('SmartHealth — Temporal Worker');
  console.log(`  Temporal: ${temporalAddress}`);
  console.log(`  Task Queue: ${taskQueue}\n`);

  const connection = await NativeConnection.connect({
    address: temporalAddress,
  });

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue,
    workflowsPath: require.resolve('./workflows'),
    activities: {
      ...patientActivities,
      ...analyticsActivities,
    },
  });

  console.log('Worker started. Waiting for workflows...\n');

  await worker.run();
}

run().catch((err) => {
  console.error('Fatal Worker error:', err);
  process.exit(1);
});
