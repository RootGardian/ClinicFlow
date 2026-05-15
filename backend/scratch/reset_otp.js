const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetOtp() {
  const email = "cardiologue@yboost.ma";
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`Utilisateur ${email} non trouvé.`);
      return;
    }

    await prisma.user.update({
      where: { email },
      data: {
        mfa_secret: null,
        mfa_enabled: true // On laisse activé pour forcer la configuration au prochain login
      }
    });

    console.log(`MFA réinitialisé avec succès pour ${email}. L'utilisateur devra scanner un nouveau QR code lors de sa prochaine connexion.`);
  } catch (error) {
    console.error("Erreur lors de la réinitialisation :", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetOtp();
