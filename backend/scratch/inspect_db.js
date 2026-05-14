const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const doctors = await prisma.doctor.findMany({ include: { user: true } });
    console.log('--- Doctors ---');
    doctors.forEach(d => console.log(`${d.id}: ${d.user.first_name} ${d.user.last_name}`));

    const appointments = await prisma.appointment.findMany({
      include: { payment: true }
    });
    console.log('\n--- Appointments & Payments ---');
    appointments.forEach(a => {
      console.log(`App ID ${a.id}: Doctor ${a.doctor_id}, Status ${a.status}, Payment Status ${a.payment?.status || 'N/A'}, Amount ${a.payment?.amount || 'N/A'}`);
    });

    const payments = await prisma.payment.findMany();
    console.log('\n--- All Payments ---');
    console.log(payments);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
