const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Enabling MFA for all users...");
  const result = await prisma.user.updateMany({
    data: {
      mfa_enabled: true
    }
  });
  console.log(`${result.count} users updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
