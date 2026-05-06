/**
 * ═══════════════════════════════════════════════════════════════
 * Script d'Import Synthea → SmartHealth
 * ═══════════════════════════════════════════════════════════════
 *
 * Lit les fichiers FHIR R4 Bundle générés par Synthea et les importe dans :
 *   1. La table `fhir_resources` (JSONB) — TOUTES les ressources brutes
 *   2. La table `Patient` (relationnelle) — pour les analyses PySpark
 *
 * Usage : npx ts-node scripts/import-synthea.ts <chemin_dossier_synthea>
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../apps/ingestion-service/.env') });

const prisma = new PrismaClient();

// ─── Compteurs globaux ───────────────────────────────────
const stats = {
  filesProcessed: 0,
  filesSkipped: 0,
  fhirResourcesInserted: 0,
  relationalPatientsCreated: 0,
  errors: 0,
  resourceTypes: {} as Record<string, number>,
};

// ─── Extraction du nom/prénom/genre/date depuis un FHIR Patient ──
function extractPatientFields(resource: any) {
  const name = resource.name?.[0] || {};
  const firstName = name.given?.[0] || 'Unknown';
  const lastName = name.family || 'Unknown';
  const gender = resource.gender || 'unknown';
  const birthDate = resource.birthDate
    ? new Date(resource.birthDate)
    : new Date('2000-01-01');

  return { firstName, lastName, gender, birthDate };
}

// ─── Traiter un seul Bundle ──────────────────────────────
async function processBundle(filePath: string) {
  const fileName = path.basename(filePath);

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const bundle = JSON.parse(raw);

    if (bundle.resourceType !== 'Bundle' || !Array.isArray(bundle.entry)) {
      console.log(`   ⏭  ${fileName} — pas un Bundle FHIR valide, ignoré.`);
      stats.filesSkipped++;
      return;
    }

    const entries = bundle.entry;
    let fhirInserted = 0;
    let patientCreated = 0;

    // Batch insert: on prépare les données
    const fhirData: { resourceType: string; content: any }[] = [];

    for (const entry of entries) {
      const resource = entry.resource;
      if (!resource || !resource.resourceType) continue;

      const resType = resource.resourceType;

      // Compter par type
      stats.resourceTypes[resType] = (stats.resourceTypes[resType] || 0) + 1;

      // Stocker en JSONB
      fhirData.push({
        resourceType: resType,
        content: resource,
      });
    }

    // Insertion en batch (par lots de 500 pour éviter les timeouts)
    const BATCH_SIZE = 500;
    for (let i = 0; i < fhirData.length; i += BATCH_SIZE) {
      const batch = fhirData.slice(i, i + BATCH_SIZE);
      await prisma.fhirResource.createMany({ data: batch });
      fhirInserted += batch.length;
    }

    // Créer aussi les patients en relationnel pour PySpark
    const patientResources = entries
      .filter((e: any) => e.resource?.resourceType === 'Patient')
      .map((e: any) => e.resource);

    for (const patientRes of patientResources) {
      try {
        const { firstName, lastName, gender, birthDate } =
          extractPatientFields(patientRes);

        await prisma.patient.create({
          data: { firstName, lastName, gender, birthDate },
        });
        patientCreated++;
      } catch {
        // Doublon ou erreur — on continue
      }
    }

    stats.fhirResourcesInserted += fhirInserted;
    stats.relationalPatientsCreated += patientCreated;
    stats.filesProcessed++;

    console.log(
      `   ✅ ${fileName} — ${fhirInserted} ressources FHIR` +
        (patientCreated > 0 ? ` + ${patientCreated} patient(s) relationnel(s)` : ''),
    );
  } catch (error: any) {
    console.error(`   ❌ ${fileName} — Erreur : ${error.message}`);
    stats.errors++;
  }
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  const synthDir =
    process.argv[2] ||
    'C:\\Users\\Mahalahatse\\Downloads\\synthea_sample_data_fhir_latest';

  console.log('══════════════════════════════════════════════════');
  console.log('  📥 SmartHealth — Import Synthea FHIR R4');
  console.log('══════════════════════════════════════════════════');
  console.log(`  📂 Dossier source : ${synthDir}\n`);

  if (!fs.existsSync(synthDir)) {
    console.error(`❌ Le dossier "${synthDir}" n'existe pas.`);
    process.exit(1);
  }

  // Lister les fichiers JSON
  const files = fs
    .readdirSync(synthDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(synthDir, f));

  console.log(`  📄 ${files.length} fichiers JSON trouvés.\n`);
  console.log('─────────────────────────────────────────────────');

  const startTime = Date.now();

  for (const file of files) {
    await processBundle(file);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n══════════════════════════════════════════════════');
  console.log('  📊 RÉSUMÉ DE L\'IMPORT');
  console.log('══════════════════════════════════════════════════');
  console.log(`  ⏱  Durée totale           : ${elapsed}s`);
  console.log(`  📄 Fichiers traités        : ${stats.filesProcessed}`);
  console.log(`  ⏭  Fichiers ignorés        : ${stats.filesSkipped}`);
  console.log(`  💾 Ressources FHIR (JSONB) : ${stats.fhirResourcesInserted}`);
  console.log(`  👤 Patients relationnels   : ${stats.relationalPatientsCreated}`);
  console.log(`  ❌ Erreurs                 : ${stats.errors}`);
  console.log('\n  📊 Répartition par type de ressource :');

  const sorted = Object.entries(stats.resourceTypes).sort(
    (a, b) => b[1] - a[1],
  );
  for (const [type, count] of sorted) {
    console.log(`     ${type.padEnd(25)} : ${count}`);
  }

  console.log('══════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur fatale :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
