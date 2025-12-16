import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ================================
  // 1. CLEAR EXISTING DATA (Optional)
  // ================================
  console.log('📦 Clearing existing data...');
  await prisma.aIUsageLog.deleteMany();
  await prisma.aIUsageDaily.deleteMany();
  await prisma.consumptionLimit.deleteMany();
  await prisma.mensaje.deleteMany();
  await prisma.conversacion.deleteMany();
  await prisma.cita.deleteMany();
  await prisma.slotLock.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.agenda.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.especialidad.deleteMany();
  await prisma.adminEntidad.deleteMany();
  await prisma.entidadMedica.deleteMany();
  await prisma.user.deleteMany();

  // ================================
  // 2. CREATE USERS
  // ================================
  console.log('\n👤 Creating users...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // SuperAdmin
  const superAdmin = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@elai.com',
      password: hashedPassword,
      rol: 'SUPERADMIN',
      telefono: '+57 300 123 4567',
    },
  });
  console.log('✓ SuperAdmin created:', superAdmin.username);

  // Admin Entidad
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin_clinica',
      email: 'admin@clinicaelai.com',
      password: hashedPassword,
      rol: 'ADMIN_ENTIDAD',
      telefono: '+57 300 234 5678',
    },
  });
  console.log('✓ Admin Entidad created:', adminUser.username);

  // Medico User
  const medicoUser = await prisma.user.create({
    data: {
      username: 'dr.garcia',
      email: 'garcia@clinicaelai.com',
      password: hashedPassword,
      rol: 'MEDICO',
      telefono: '+57 300 345 6789',
    },
  });
  console.log('✓ Medico user created:', medicoUser.username);

  const medicoUser2 = await prisma.user.create({
    data: {
      username: 'dra.martinez',
      email: 'martinez@clinicaelai.com',
      password: hashedPassword,
      rol: 'MEDICO',
      telefono: '+57 300 456 7890',
    },
  });
  console.log('✓ Medico user created:', medicoUser2.username);

  // ================================
  // 3. CREATE MEDICAL ENTITY
  // ================================
  console.log('\n🏥 Creating medical entity...');

  const entidadMedica = await prisma.entidadMedica.create({
    data: {
      nombre: 'Clínica ELAI',
      tipoEntidad: 'CLINICA',
      nitRut: '900123456-7',
      direccion: 'Calle 123 #45-67',
      ciudad: 'Bogotá',
      departamentoEstado: 'Cundinamarca',
      codigoPostal: '110111',
      telefonoPrincipal: '+57 1 234 5678',
      telefonoSecundario: '+57 1 234 5679',
      email: 'info@clinicaelai.com',
      emailContacto: 'contacto@clinicaelai.com',
      sitioWeb: 'https://clinicaelai.com',
      permiteCitasOnline: true,
      requiereAutorizacionCitas: false,
    },
  });
  console.log('✓ Medical entity created:', entidadMedica.nombre);

  // Link admin to entity
  await prisma.adminEntidad.create({
    data: {
      userId: adminUser.id,
      entidadMedicaId: entidadMedica.id,
      permisos: {
        gestionPacientes: true,
        gestionMedicos: true,
        gestionAgendas: true,
        reportes: true,
      },
    },
  });
  console.log('✓ Admin linked to entity');

  // ================================
  // 4. CREATE SPECIALTIES
  // ================================
  console.log('\n⚕️  Creating specialties...');

  const especialidades = await Promise.all([
    prisma.especialidad.create({
      data: {
        nombre: 'Medicina General',
        duracionCita: 30,
        descripcion: 'Atención médica general',
      },
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Cardiología',
        duracionCita: 45,
        descripcion: 'Especialidad en enfermedades del corazón',
      },
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Pediatría',
        duracionCita: 30,
        descripcion: 'Atención médica infantil',
      },
    }),
    prisma.especialidad.create({
      data: {
        nombre: 'Dermatología',
        duracionCita: 30,
        descripcion: 'Especialidad en enfermedades de la piel',
      },
    }),
  ]);

  especialidades.forEach((esp) => {
    console.log(`✓ Specialty created: ${esp.nombre}`);
  });

  // ================================
  // 5. CREATE DOCTORS
  // ================================
  console.log('\n👨‍⚕️  Creating doctors...');

  const medico1 = await prisma.medico.create({
    data: {
      userId: medicoUser.id,
      entidadMedicaId: entidadMedica.id,
      especialidadId: especialidades[0].id, // Medicina General
      numeroLicencia: 'MED-12345',
    },
  });
  console.log(`✓ Doctor created: Dr. García (${especialidades[0].nombre})`);

  const medico2 = await prisma.medico.create({
    data: {
      userId: medicoUser2.id,
      entidadMedicaId: entidadMedica.id,
      especialidadId: especialidades[1].id, // Cardiología
      numeroLicencia: 'MED-67890',
    },
  });
  console.log(`✓ Doctor created: Dra. Martínez (${especialidades[1].nombre})`);

  // ================================
  // 6. CREATE PATIENTS
  // ================================
  console.log('\n🧑‍🤝‍🧑 Creating patients...');

  const pacientes = await Promise.all([
    prisma.paciente.create({
      data: {
        entidadMedicaId: entidadMedica.id,
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez López',
        fechaNacimiento: new Date('1985-03-15'),
        genero: 'MASCULINO',
        estadoCivil: 'CASADO',
        epsAseguradora: 'Sura EPS',
        tipoSangre: 'O+',
        telefono: '+57 310 123 4567',
        email: 'juan.perez@email.com',
        direccion: 'Cra 10 #20-30',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        contactoEmergenciaNombre: 'María Pérez',
        contactoEmergenciaTelefono: '+57 310 987 6543',
      },
    }),
    prisma.paciente.create({
      data: {
        entidadMedicaId: entidadMedica.id,
        tipoDocumento: 'CC',
        numeroDocumento: '9876543210',
        nombres: 'Ana María',
        apellidos: 'González Ramírez',
        fechaNacimiento: new Date('1990-07-22'),
        genero: 'FEMENINO',
        estadoCivil: 'SOLTERO',
        epsAseguradora: 'Sanitas EPS',
        tipoSangre: 'A+',
        telefono: '+57 320 234 5678',
        email: 'ana.gonzalez@email.com',
        direccion: 'Calle 50 #15-25',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        contactoEmergenciaNombre: 'Pedro González',
        contactoEmergenciaTelefono: '+57 320 876 5432',
      },
    }),
  ]);

  pacientes.forEach((p) => {
    console.log(`✓ Patient created: ${p.nombres} ${p.apellidos}`);
  });

  // ================================
  // 7. CREATE AGENDAS
  // ================================
  console.log('\n📅 Creating agendas...');

  const agenda1 = await prisma.agenda.create({
    data: {
      medicoId: medico1.id,
      entidadMedicaId: entidadMedica.id,
      nombre: 'Consulta General - Lunes',
      diaSemana: 'LUNES',
      horaInicio: '08:00',
      horaFin: '12:00',
      duracionSlot: 30,
    },
  });
  console.log(`✓ Agenda created: ${agenda1.nombre}`);

  const agenda2 = await prisma.agenda.create({
    data: {
      medicoId: medico2.id,
      entidadMedicaId: entidadMedica.id,
      nombre: 'Cardiología - Martes',
      diaSemana: 'MARTES',
      horaInicio: '14:00',
      horaFin: '18:00',
      duracionSlot: 45,
    },
  });
  console.log(`✓ Agenda created: ${agenda2.nombre}`);

  // ================================
  // 8. CREATE SLOTS
  // ================================
  console.log('\n🕐 Creating slots...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const slots = await Promise.all([
    prisma.slot.create({
      data: {
        agendaId: agenda1.id,
        fecha: tomorrow,
        horaInicio: '08:00',
        horaFin: '08:30',
        estado: 'DISPONIBLE',
      },
    }),
    prisma.slot.create({
      data: {
        agendaId: agenda1.id,
        fecha: tomorrow,
        horaInicio: '08:30',
        horaFin: '09:00',
        estado: 'DISPONIBLE',
      },
    }),
    prisma.slot.create({
      data: {
        agendaId: agenda1.id,
        fecha: tomorrow,
        horaInicio: '09:00',
        horaFin: '09:30',
        estado: 'DISPONIBLE',
      },
    }),
  ]);

  console.log(`✓ ${slots.length} slots created`);

  // ================================
  // 9. CREATE CONSUMPTION LIMITS
  // ================================
  console.log('\n⚡ Creating consumption limits...');

  const consumptionLimit = await prisma.consumptionLimit.create({
    data: {
      entidadMedicaId: entidadMedica.id,
      limiteTokensDiario: 10000,
      limiteTokensSemanal: 50000,
      limiteTokensMensual: 150000,
      alertaUmbralPorcent: 80,
      alertasActivas: true,
    },
  });
  console.log('✓ Consumption limits created');

  // ================================
  // SUMMARY
  // ================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\n📊 CREATED RECORDS:');
  console.log(`   - Users: 4 (1 SuperAdmin, 1 Admin, 2 Medicos)`);
  console.log(`   - Medical Entity: ${entidadMedica.nombre}`);
  console.log(`   - Specialties: ${especialidades.length}`);
  console.log(`   - Doctors: 2`);
  console.log(`   - Patients: ${pacientes.length}`);
  console.log(`   - Agendas: 2`);
  console.log(`   - Slots: ${slots.length}`);

  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('='.repeat(60));
  console.log('\n1️⃣  SUPERADMIN:');
  console.log(`   Username: superadmin`);
  console.log(`   Password: admin123`);
  console.log(`   Email: superadmin@elai.com`);

  console.log('\n2️⃣  ADMIN ENTIDAD:');
  console.log(`   Username: admin_clinica`);
  console.log(`   Password: admin123`);
  console.log(`   Email: admin@clinicaelai.com`);

  console.log('\n3️⃣  MEDICO 1 (Medicina General):');
  console.log(`   Username: dr.garcia`);
  console.log(`   Password: admin123`);
  console.log(`   Email: garcia@clinicaelai.com`);

  console.log('\n4️⃣  MEDICO 2 (Cardiología):');
  console.log(`   Username: dra.martinez`);
  console.log(`   Password: admin123`);
  console.log(`   Email: martinez@clinicaelai.com`);

  console.log('\n' + '='.repeat(60));
  console.log('🚀 You can now start the application and login!');
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
