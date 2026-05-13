const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@yboost.ma';
  const password = 'admin@1234';
  const pepper = process.env.PASSWORD_PEPPER || '';

  // Hasher le mot de passe avec Salt and Pepper
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password + pepper, salt);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'admin',
      password: hashedPassword,
    },
    create: {
      email,
      first_name: 'Admin',
      last_name: 'Yboost',
      password: hashedPassword,
      role: 'admin',
      is_profile_completed: true,
    },
  });

  console.log('✅ Compte Administrateur créé/mis à jour :', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
