/**
 * Seed Script — Crée le tout premier compte ADMIN dans la base de données.
 *
 * Usage : pnpm run seed
 *
 * Ce script est la SEULE façon de créer le premier administrateur.
 * Ensuite, cet admin pourra créer d'autres comptes via POST /auth/register.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@smarthealth.com';
  const adminPassword = 'Admin123!';

  // Vérifier si l'admin existe déjà
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(`\n⚠️  L'admin "${adminEmail}" existe déjà en base.`);
    console.log(`   Rôle : ${existing.role}`);
    console.log(`   ID   : ${existing.id}\n`);
    return;
  }

  // Créer le premier admin
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('\n✅ Premier administrateur créé avec succès !');
  console.log('────────────────────────────────────────');
  console.log(`   Email    : ${admin.email}`);
  console.log(`   Password : ${adminPassword}`);
  console.log(`   Rôle     : ${admin.role}`);
  console.log(`   ID       : ${admin.id}`);
  console.log('────────────────────────────────────────');
  console.log('⚠️  CHANGE CE MOT DE PASSE EN PRODUCTION !\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
