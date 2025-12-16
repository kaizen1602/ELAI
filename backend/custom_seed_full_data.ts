import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

const SINTOMAS_DB = [
    { motivo: "Dolor abdominal", sintomas: "Dolor punzante en el lado derecho, náuseas, fiebre baja." },
    { motivo: "Revisión anual", sintomas: "Ninguno, paciente asintomático para chequeo general." },
    { motivo: "Gripe persistente", sintomas: "Congestión nasal, tos seca, dolor de garganta y fatiga por más de 10 días." },
    { motivo: "Alergia estacional", sintomas: "Ojos llorosos, estornudos frecuentes, picazón en la garganta." },
    { motivo: "Dolor de espalda", sintomas: "Dolor lumbar que se irradia a la pierna derecha, dificultad para agacharse." },
    { motivo: "Control diabetes", sintomas: "Sed excesiva, micción frecuente, visión borrosa ocasional." },
    { motivo: "Migraña", sintomas: "Dolor pulsátil unilateral, fotofobia, fonofobia." },
    { motivo: "Ansiedad", sintomas: "Palpitaciones, sensación de falta de aire, insomnio." },
    { motivo: "Lesión deportiva", sintomas: "Inflamación en rodilla derecha, dolor al apoyar." },
    { motivo: "Control hipertensión", sintomas: "Cefalea matutina, zumbido de oídos." }
];

async function main() {
    console.log('Starting full data seeding...');

    // 1. Get Base Data
    const medicos = await prisma.medico.findMany({ include: { user: true } });
    const pacientes = await prisma.paciente.findMany();
    const entidad = await prisma.entidadMedica.findFirst();

    if (medicos.length === 0 || pacientes.length === 0 || !entidad) {
        console.error('Missing base data (Medicos, Pacientes, or EntidadMedica).');
        return;
    }

    console.log(`Found ${medicos.length} medicos and ${pacientes.length} pacientes.`);

    // 2. Create Agendas for all Medicos for varied days
    for (const medico of medicos) {
        console.log(`Processing medico: ${medico.user?.username}`);

        // Create Agendas for Mon-Fri
        for (const dia of ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']) {
            // Check if agenda exists
            const existingAgenda = await prisma.agenda.findFirst({
                where: { medicoId: medico.id, diaSemana: dia as any }
            });

            if (!existingAgenda) {
                await prisma.agenda.create({
                    data: {
                        medicoId: medico.id,
                        entidadMedicaId: entidad.id,
                        nombre: `Agenda ${dia} - ${medico.user?.username}`,
                        diaSemana: dia as any,
                        horaInicio: "08:00",
                        horaFin: "17:00",
                        duracionSlot: 30, // 30 mins
                        activa: true
                    }
                });
                console.log(`  Created Agenda for ${dia}`);
            }
        }
    }

    // 3. Generate Slots for Next Month (Simulated logic, simplistic)
    // We will actually just find the agendas we just made/found and ensure they have slots for specific dates
    const agendas = await prisma.agenda.findMany({ where: { medicoId: { in: medicos.map(m => m.id) } } });

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    // Helper to get dates for a specific day of week
    const getDatesForDay = (dayName: string, start: Date, end: Date) => {
        const dates = [];
        const d = new Date(start);
        const dayIndex = { 'DOMINGO': 0, 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6 }[dayName];

        while (d <= end) {
            if (d.getDay() === dayIndex) {
                dates.push(new Date(d));
            }
            d.setDate(d.getDate() + 1);
        }
        return dates;
    };

    for (const agenda of agendas) {
        const dates = getDatesForDay(agenda.diaSemana, today, nextMonth);

        for (const date of dates) {
            // Simple 08:00 - 12:00 generation for demo
            for (let hour = 8; hour < 12; hour++) {
                for (let min = 0; min < 60; min += agenda.duracionSlot) {
                    const startTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

                    // End time logic
                    let endMin = min + agenda.duracionSlot;
                    let endHour = hour;
                    if (endMin >= 60) {
                        endMin -= 60;
                        endHour += 1;
                    }
                    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

                    const fechaStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

                    // Check exist
                    const exists = await prisma.slot.findFirst({
                        where: { agendaId: agenda.id, fecha: date, horaInicio: startTime }
                    });

                    if (!exists) {
                        await prisma.slot.create({
                            data: {
                                agendaId: agenda.id,
                                fecha: date,
                                horaInicio: startTime,
                                horaFin: endTime,
                                estado: 'DISPONIBLE'
                            }
                        });
                    }
                }
            }
        }
    }
    console.log('Slots seeded.');

    // 4. Create Random Citas
    const allSlots = await prisma.slot.findMany({
        where: { estado: 'DISPONIBLE' },
        take: 50 // Limit to 50 new citas
    });

    console.log(`Creating citas for ${allSlots.length} available slots...`);

    for (const slot of allSlots) {
        if (Math.random() > 0.3) continue; // 30% chance to book a slot

        const paciente = pacientes[Math.floor(Math.random() * pacientes.length)];
        const data = SINTOMAS_DB[Math.floor(Math.random() * SINTOMAS_DB.length)];
        const estado = Math.random() > 0.7 ? 'PENDIENTE' :
            Math.random() > 0.4 ? 'CONFIRMADA' :
                Math.random() > 0.2 ? 'COMPLETADA' : 'CANCELADA';

        await prisma.cita.create({
            data: {
                slotId: slot.id,
                pacienteId: paciente.id,
                estado: estado as any,
                motivoConsulta: data.motivo,
                sintomas: data.sintomas,
                notas: "Generada automáticamente"
            }
        });

        await prisma.slot.update({
            where: { id: slot.id },
            data: {
                estado: estado === 'PENDIENTE' ? 'RESERVADO' :
                    estado === 'CONFIRMADA' ? 'CONFIRMADO' :
                        estado === 'COMPLETADA' ? 'BLOQUEADO' : 'DISPONIBLE'
            }
        });
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
