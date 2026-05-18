import { Connection, Client } from '@temporalio/client';
import { scheduledAnalyticsWorkflow } from './workflows/analytics.workflow';

async function run() {
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const connection = await Connection.connect({ address: temporalAddress });
  const client = new Client({ connection });

  console.log(' Scheduling PySpark Cron workflow...');

  // Daily schedule at 2:00 AM for Big Data analysis
  const handle = await client.workflow.start(scheduledAnalyticsWorkflow, {
    taskQueue: 'smarthealth-emergency',
    workflowId: 'analytics-cron-job',
    cronSchedule: '0 2 * * *',
  });

  console.log(`Cron Workflow scheduled!`);
  console.log(`   ID: ${handle.workflowId}`);
  console.log(`   The PySpark script will run automatically every day at 02:00 AM.`);
}

run().catch((err) => {
  console.error('Scheduling error:', err);
  process.exit(1);
});
