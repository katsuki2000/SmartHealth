/**
 * Worker Temporal — SmartHealth
 *
 * Ce processus se connecte au serveur Temporal (localhost:7233),
 * enregistre les workflows et les activities, et commence à
 * écouter la task queue "smarthealth-emergency".
 *
 * Usage : pnpm run start (ou pnpm run dev)
 */
import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities/patient-activities';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function run() {
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'smarthealth-emergency';

  console.log('══════════════════════════════════════════════════');
  console.log('  🏥 SmartHealth — Temporal Worker');
  console.log(`  📡 Connexion à Temporal : ${temporalAddress}`);
  console.log(`  📬 Task Queue : ${taskQueue}`);
  console.log('══════════════════════════════════════════════════');

  // Connexion au serveur Temporal
  const connection = await NativeConnection.connect({
    address: temporalAddress,
  });

  // Création du Worker
  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue,
    // Chemin vers les workflows (Temporal les bundle automatiquement)
    workflowsPath: require.resolve('./workflows/emergency-admission.workflow'),
    // Les activities sont passées directement (elles ont accès au contexte Node.js)
    activities,
  });

  console.log('✅ Worker démarré ! En attente de workflows...');
  console.log('   (Ctrl+C pour arrêter)\n');

  // Le worker tourne indéfiniment jusqu'à interruption
  await worker.run();
}

run().catch((err) => {
  console.error('❌ Erreur fatale du Worker :', err);
  process.exit(1);
});
