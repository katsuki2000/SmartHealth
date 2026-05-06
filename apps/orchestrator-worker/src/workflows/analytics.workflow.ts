import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/analytics-activities';

const { runPySparkAnalytics } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes', // PySpark can take some time
  retry: {
    initialInterval: '1 minute',
    maximumInterval: '10 minutes',
    maximumAttempts: 3,
  },
});

/**
 * Workflow Cron pour exécuter le job PySpark.
 * Il sera déclenché périodiquement (ex: tous les soirs).
 */
export async function scheduledAnalyticsWorkflow(): Promise<string> {
  console.log(`[Workflow] Lancement de scheduledAnalyticsWorkflow...`);
  
  const result = await runPySparkAnalytics();
  
  console.log(`[Workflow] scheduledAnalyticsWorkflow terminé avec succès.`);
  return result;
}
