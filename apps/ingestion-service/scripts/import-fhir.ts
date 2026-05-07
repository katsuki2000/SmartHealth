/**
 * ═══════════════════════════════════════════════════════════════
 * SmartHealth — Importeur Universel de Ressources FHIR R4
 * ═══════════════════════════════════════════════════════════════
 *
 * Ce script est générique et interopérable : il accepte tout dossier
 * contenant des fichiers JSON conformes au standard FHIR R4, quelle
 * que soit la source (Synthea, HAPI FHIR, Epic, Cerner, HL7, etc.).
 *
 * Deux formats sont supportés :
 *   - Bundle FHIR   : { "resourceType": "Bundle", "entry": [...] }
 *   - Ressource seule : { "resourceType": "Patient", ... }
 *
 * Usage :
 *   npx ts-node scripts/import-fhir.ts <chemin_du_dossier> [--source <nom_source>]
 *
 * Exemples :
 *   npx ts-node scripts/import-fhir.ts ./data/synthea --source Synthea
 *   npx ts-node scripts/import-fhir.ts C:\exports\hopital --source HopitalAmiens
 *   npx ts-node scripts/import-fhir.ts /tmp/hapi-export --source HAPI-FHIR
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// ─── Compteurs globaux ────────────────────────────────────
const stats = {
  filesProcessed: 0,
  filesSkipped: 0,
  filesInvalid: 0,
  fhirResourcesInserted: 0,
  fhirResourcesDuplicated: 0,
  relationalPatientsCreated: 0,
  errors: 0,
  resourceTypes: {} as Record<string, number>,
};

// ─── Extraction des champs Patient (format universel FHIR) ──
// Compatible Synthea, HAPI, Epic, Cerner, etc.
function extractPatientFields(resource: any): {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: Date;
} {
  // FHIR R4 : resource.name peut contenir plusieurs entrées
  // On cherche le nom "official" en priorité, sinon le premier disponible
  const names: any[] = resource.name || [];
  const officialName =
    names.find((n: any) => n.use === 'official') || names[0] || {};

  const firstName =
    [officialName.given].flat().filter(Boolean).join(' ') || 'Inconnu';
  const lastName = officialName.family || 'Inconnu';

  // FHIR R4 : gender = male | female | other | unknown
  const gender = resource.gender || 'unknown';

  // FHIR R4 : birthDate au format YYYY-MM-DD ou YYYY-MM ou YYYY
  let birthDate: Date;
  if (resource.birthDate) {
    birthDate = new Date(resource.birthDate);
    // Vérification que la date est valide
    if (isNaN(birthDate.getTime())) {
      birthDate = new Date('1900-01-01');
    }
  } else {
    birthDate = new Date('1900-01-01');
  }

  return { firstName, lastName, gender, birthDate };
}

// ─── Extraire les ressources d'un fichier (Bundle ou standalone) ──
function extractResources(fileContent: any, fileName: string): any[] {
  // Cas 1 : C'est un Bundle FHIR (format Synthea, exports hospitaliers, etc.)
  if (fileContent.resourceType === 'Bundle') {
    if (!Array.isArray(fileContent.entry)) {
      console.log(
        `   ⚠️  ${fileName} — Bundle sans entrées (entry vide), ignoré.`,
      );
      stats.filesSkipped++;
      return [];
    }
    return fileContent.entry
      .map((e: any) => e.resource)
      .filter((r: any) => r && r.resourceType);
  }

  // Cas 2 : C'est une ressource FHIR standalone (ex: un seul Patient.json)
  if (fileContent.resourceType) {
    return [fileContent];
  }

  // Cas 3 : Tableau de ressources (format non-standard mais courant)
  if (Array.isArray(fileContent)) {
    return fileContent.filter((r: any) => r && r.resourceType);
  }

  // Cas 4 : Format non reconnu
  console.log(
    `   ⏭  ${fileName} — Format JSON non reconnu comme FHIR, ignoré.`,
  );
  stats.filesInvalid++;
  return [];
}

// ─── Traiter un seul fichier ──────────────────────────────
async function processFile(filePath: string, source: string) {
  const fileName = path.basename(filePath);

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    let parsed: any;

    try {
      parsed = JSON.parse(raw);
    } catch {
      console.log(`   ❌ ${fileName} — JSON invalide, ignoré.`);
      stats.filesSkipped++;
      return;
    }

    const resources = extractResources(parsed, fileName);
    if (resources.length === 0) return;

    let fhirInserted = 0;
    let fhirDuplicates = 0;
    let patientCreated = 0;

    // Préparer les données pour le batch insert
    const fhirData: { resourceType: string; content: any }[] = [];

    for (const resource of resources) {
      const resType = resource.resourceType;
      stats.resourceTypes[resType] = (stats.resourceTypes[resType] || 0) + 1;

      fhirData.push({
        resourceType: resType,
        content: resource,
      });
    }

    // Insertion en batch (par lots de 500)
    const BATCH_SIZE = 500;
    for (let i = 0; i < fhirData.length; i += BATCH_SIZE) {
      const batch = fhirData.slice(i, i + BATCH_SIZE);
      try {
        const result = await prisma.fhirResource.createMany({
          data: batch,
          skipDuplicates: true,  // Ignore les doublons si un index unique existe
        });
        fhirInserted += result.count;
        fhirDuplicates += batch.length - result.count;
      } catch {
        // Fallback : insertion une par une pour les erreurs de contraintes
        for (const item of batch) {
          try {
            await prisma.fhirResource.create({ data: item });
            fhirInserted++;
          } catch {
            fhirDuplicates++;
          }
        }
      }
    }

    // Synchroniser les patients dans la table relationnelle (pour PySpark)
    const patientResources = resources.filter(
      (r: any) => r.resourceType === 'Patient',
    );

    for (const patientRes of patientResources) {
      try {
        const { firstName, lastName, gender, birthDate } =
          extractPatientFields(patientRes);

        await prisma.patient.create({
          data: { firstName, lastName, gender, birthDate },
        });
        patientCreated++;
      } catch {
        // Doublon relationnel — le patient FHIR est déjà importé en JSONB
      }
    }

    stats.fhirResourcesInserted += fhirInserted;
    stats.fhirResourcesDuplicated += fhirDuplicates;
    stats.relationalPatientsCreated += patientCreated;
    stats.filesProcessed++;

    const dupMsg =
      fhirDuplicates > 0 ? ` (${fhirDuplicates} doublons ignorés)` : '';
    const patMsg =
      patientCreated > 0 ? ` + ${patientCreated} patient(s)` : '';
    console.log(
      `   ✅ ${fileName} — ${fhirInserted} ressources FHIR${patMsg}${dupMsg}`,
    );
  } catch (error: any) {
    console.error(`   ❌ ${fileName} — Erreur : ${error.message}`);
    stats.errors++;
  }
}

// ─── Analyse des arguments CLI ───────────────────────────
function parseArgs(): { dir: string; source: string } {
  const args = process.argv.slice(2);

  // Récupérer --source si présent
  const sourceIdx = args.indexOf('--source');
  const source =
    sourceIdx !== -1 && args[sourceIdx + 1] ? args[sourceIdx + 1] : 'Inconnu';

  // Le premier argument non-flag est le dossier
  const dir =
    args.find((a) => !a.startsWith('--') && a !== source) ||
    'C:\\Users\\Mahalahatse\\Downloads\\Compressed\\synthea_sample_data_fhir_r4_nov2021\\fhir';

  return { dir, source };
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  const { dir: fhirDir, source } = parseArgs();

  console.log('══════════════════════════════════════════════════');
  console.log('  📥 SmartHealth — Importeur Universel FHIR R4');
  console.log('══════════════════════════════════════════════════');
  console.log(`  📂 Dossier source : ${fhirDir}`);
  console.log(`  🏷️  Source         : ${source}\n`);

  if (!fs.existsSync(fhirDir)) {
    console.error(`❌ Le dossier "${fhirDir}" n'existe pas.`);
    console.error(
      `   Usage : npx ts-node scripts/import-fhir.ts <chemin> [--source <nom>]`,
    );
    process.exit(1);
  }

  // Lister les fichiers JSON (non-récursif par défaut)
  const files = fs
    .readdirSync(fhirDir)
    .filter((f) => f.toLowerCase().endsWith('.json'))
    .map((f) => path.join(fhirDir, f));

  if (files.length === 0) {
    console.error(
      `❌ Aucun fichier .json trouvé dans "${fhirDir}". Vérifiez le chemin.`,
    );
    process.exit(1);
  }

  console.log(`  📄 ${files.length} fichiers JSON trouvés.\n`);
  console.log('─────────────────────────────────────────────────');

  const startTime = Date.now();

  for (const file of files) {
    await processFile(file, source);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n══════════════════════════════════════════════════');
  console.log('  📊 RÉSUMÉ DE L\'IMPORT FHIR R4');
  console.log('══════════════════════════════════════════════════');
  console.log(`  🏷️  Source FHIR              : ${source}`);
  console.log(`  ⏱️  Durée totale             : ${elapsed}s`);
  console.log(`  📄 Fichiers traités          : ${stats.filesProcessed}`);
  console.log(`  ⏭️  Fichiers ignorés          : ${stats.filesSkipped}`);
  console.log(`  ⚠️  Fichiers invalides        : ${stats.filesInvalid}`);
  console.log(`  💾 Ressources FHIR (JSONB)   : ${stats.fhirResourcesInserted}`);
  console.log(`  🔁 Doublons ignorés          : ${stats.fhirResourcesDuplicated}`);
  console.log(`  👤 Patients relationnels     : ${stats.relationalPatientsCreated}`);
  console.log(`  ❌ Erreurs                   : ${stats.errors}`);
  console.log('\n  📊 Répartition par type de ressource FHIR :');

  const sorted = Object.entries(stats.resourceTypes).sort(
    (a, b) => b[1] - a[1],
  );
  for (const [type, count] of sorted) {
    console.log(`     ${type.padEnd(30)} : ${count}`);
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
