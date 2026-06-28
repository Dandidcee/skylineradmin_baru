import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@skyflow.id';
  const existing = await prisma.user.findUnique({ where: { email } });
  
  const hashedPassword = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { email },
    update: {
      role: 'OWNER',
      permissions: JSON.stringify(['ALL']),
    },
    create: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'OWNER',
      permissions: JSON.stringify(['ALL']),
    }
  });
  console.log('Seeded admin user!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
