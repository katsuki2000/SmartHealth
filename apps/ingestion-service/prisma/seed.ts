/**
 * Seed Script — Creates the first ADMIN account in the database.
 *
 * Usage: pnpm run seed
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@smarthealth.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(`Admin "${adminEmail}" already exists (ID: ${existing.id}).`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('First administrator created successfully.');
  console.log(`  Email : ${admin.email}`);
  console.log(`  Role  : ${admin.role}`);
  console.log(`  ID    : ${admin.id}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
