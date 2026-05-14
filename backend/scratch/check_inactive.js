const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const inactiveUsers = await prisma.user.count({ where: { is_active: false } });
  console.log('Inactive users count:', inactiveUsers);
  process.exit(0);
}

main();
