const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const specialties = [
  'Médecin Généraliste', 'Cardiologue', 'Dermatologue', 'Gynécologue', 
  'Ophtalmologue', 'ORL', 'Rhumatologue', 'Neurologue', 
  'Pédiatre', 'Orthopédiste', 'Psychiatre', 'Gastro-entérologue', 
  'Endocrinologue', 'Urologue', 'Néphrologue', 'Oncologue', 
  'Pneumologue', 'Dentiste', 'Nutritionniste', 'Radiologue'
];

async function main() {
  const password = 'Guinee224';
  const pepper = 'ClinicFlow_Ultra_Secret_Pepper_2024_#88';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password + pepper, salt);

  console.log(`🚀 Début de la création de ${specialties.length} médecins...`);

  for (const specialty of specialties) {
    const slug = specialty.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlever accents
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/[^\w-]/g, ''); // Enlever caractères spéciaux

    const email = `${slug}@yboost.ma`;

    try {
      // Vérifier si l'utilisateur existe déjà
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        console.log(`- Skipping ${email} (déjà existant)`);
        continue;
      }

      const user = await prisma.user.create({
        data: {
          first_name: 'Dr.',
          last_name: specialty,
          email: email,
          password: hashedPassword,
          role: 'doctor',
          is_profile_completed: true,
          gender: 'M',
          doctor: {
            create: {
              specialty: specialty,
              bio: `Spécialiste en ${specialty} avec plusieurs années d'expérience.`,
              experience_years: Math.floor(Math.random() * 20) + 5,
              price_per_consultation: 300,
              identity_verified: true,
              license_number: `LIC-${slug.toUpperCase()}-${Math.floor(Math.random() * 10000)}`
            }
          }
        }
      });

      console.log(`✅ Créé : ${user.first_name} ${user.last_name} (${email})`);
    } catch (error) {
      console.error(`❌ Erreur pour ${email} :`, error.message);
    }
  }

  console.log('✨ Fin du script de seeding.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
