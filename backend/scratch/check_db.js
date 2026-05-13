const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, first_name: true, last_name: true, role: true, email: true }
  });
  
  console.log('--- USERS ---');
  users.forEach(u => console.log(`ID: ${u.id}, Name: ${u.first_name} ${u.last_name}, Role: ${u.role}, Email: ${u.email}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
