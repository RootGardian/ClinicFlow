const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Resetting all MFA secrets...");
  const result = await prisma.user.updateMany({
    data: { mfa_secret: null }
  });
  console.log(result.count + " users reset.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
