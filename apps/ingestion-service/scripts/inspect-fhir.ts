import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Sample Condition
  const condition = await prisma.fhirResource.findFirst({
    where: { resourceType: 'Condition' },
  });
  console.log('═══ SAMPLE CONDITION ═══');
  console.log(JSON.stringify(condition?.content, null, 2));

  // Sample Encounter
  const encounter = await prisma.fhirResource.findFirst({
    where: { resourceType: 'Encounter' },
  });
  console.log('\n═══ SAMPLE ENCOUNTER ═══');
  console.log(JSON.stringify(encounter?.content, null, 2));

  // Sample Observation
  const observation = await prisma.fhirResource.findFirst({
    where: { resourceType: 'Observation' },
  });
  console.log('\n═══ SAMPLE OBSERVATION ═══');
  console.log(JSON.stringify(observation?.content, null, 2));

  // Count by type
  const counts = await prisma.fhirResource.groupBy({
    by: ['resourceType'],
    _count: true,
    orderBy: { _count: { resourceType: 'desc' } },
  });
  console.log('\n═══ RESOURCE COUNTS ═══');
  for (const c of counts) {
    console.log(`  ${c.resourceType.padEnd(30)} : ${c._count}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
