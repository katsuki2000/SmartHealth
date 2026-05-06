import { Connection, Client } from '@temporalio/client';
import { scheduledAnalyticsWorkflow } from './workflows/analytics.workflow';

async function run() {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection });

  console.log('⏰ Planification du workflow Cron PySpark...');

  // Pour le MVP / Test, on le met pour s'exécuter toutes les minutes: '* * * * *'
  // En production, on utiliserait par exemple '0 2 * * *' (tous les jours à 2h du matin)
  const handle = await client.workflow.start(scheduledAnalyticsWorkflow, {
    taskQueue: 'smarthealth-emergency',
    workflowId: 'analytics-cron-job',
    cronSchedule: '* * * * *',
  });

  console.log(`✅ Workflow Cron planifié !`);
  console.log(`   ID : ${handle.workflowId}`);
  console.log(`   Le script PySpark s'exécutera automatiquement selon la fréquence définie.`);
}

run().catch((err) => {
  console.error('❌ Erreur de planification :', err);
  process.exit(1);
});
