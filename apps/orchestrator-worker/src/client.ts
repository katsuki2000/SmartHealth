/**
 * Client Temporal — SmartHealth
 *
 * Script pour DÉCLENCHER manuellement un workflow d'admission d'urgence.
 * C'est l'équivalent d'un bouton "Admission d'Urgence" dans l'interface.
 *
 * Usage : pnpm run start:client
 */
import { Client, Connection } from '@temporalio/client';
import { emergencyAdmissionWorkflow } from './workflows/emergency-admission.workflow';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'smarthealth-emergency';

  console.log('══════════════════════════════════════════════════');
  console.log('  🚨 SmartHealth — Déclenchement Workflow Urgence');
  console.log('══════════════════════════════════════════════════\n');

  // Connexion au serveur Temporal
  const connection = await Connection.connect({ address: temporalAddress });
  const client = new Client({ connection });

  // Données du patient d'urgence (simulation)
  const patientData = {
    firstName: 'Rakoto',
    lastName: 'Jean-Baptiste',
    birthDate: '1985-03-15',
    gender: 'male',
    reason: 'Accident de la route — Traumatisme crânien — Admission urgence',
  };

  console.log(`📋 Patient : ${patientData.firstName} ${patientData.lastName}`);
  console.log(`📝 Motif : ${patientData.reason}\n`);

  // Démarrer le workflow
  const handle = await client.workflow.start(emergencyAdmissionWorkflow, {
    taskQueue,
    workflowId: `emergency-${Date.now()}`,
    args: [patientData],
  });

  console.log(`🚀 Workflow démarré ! ID: ${handle.workflowId}`);
  console.log(`   → Suivi en temps réel : http://localhost:8233/namespaces/default/workflows/${handle.workflowId}\n`);

  // Attendre le résultat
  console.log('⏳ En attente du résultat...\n');
  const result = await handle.result();

  console.log('══════════════════════════════════════════════════');
  console.log('  ✅ WORKFLOW TERMINÉ AVEC SUCCÈS !');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Patient ID     : ${result.patientId}`);
  console.log(`  Praticien ID   : ${result.practitionerId}`);
  console.log(`  Rendez-vous ID : ${result.appointmentId}`);
  console.log(`  Statut         : ${result.status}`);
  console.log('══════════════════════════════════════════════════\n');
}

run().catch((err) => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
