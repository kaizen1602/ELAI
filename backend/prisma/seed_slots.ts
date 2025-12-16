
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Load .env from project root
// File is at backend/prisma/seed_slots.ts
// Root is ../../.env
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

// OVERRIDE DATABASE_URL FOR HOST EXECUTION
// Docker internal: postgres:5432
// Host mapping: localhost:5434
if (process.env.DATABASE_URL) {
    try {
        // Basic string replacement that protects the protocol
        // Replace 'postgres:5432' (host:port) with 'localhost:5434'
        // Replace '@postgres/' (implicit port) with '@localhost:5434/'

        let url = process.env.DATABASE_URL;

        if (url.includes('@postgres:5432')) {
            url = url.replace('@postgres:5432', '@localhost:5434');
        } else if (url.includes('@postgres')) {
            url = url.replace('@postgres', '@localhost:5434');
        }

        process.env.DATABASE_URL = url;
        console.log('🔗 Adjusted DATABASE_URL for host access (localhost:5434)');
        // console.log('DEBUG URL:', process.env.DATABASE_URL); // Debug if needed
    } catch (e) {
        console.error('Error parsing DATABASE_URL', e);
    }
}

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Extension: Seeding more slots for the next 30 days...\n');

    // 1. Get existing Agendas
    const agendas = await prisma.agenda.findMany({
        include: { medico: true, entidadMedica: true }
    });

    if (agendas.length === 0) {
        console.error('❌ No agendas found. Please run "npm run seed" first.');
        return;
    }

    console.log(`Found ${agendas.length} agendas.`);

    // 2. Generate slots for the next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    let totalSlots = 0;

    for (const agenda of agendas) {
        console.log(`\n📅 Processing Agenda: ${agenda.nombre} (${agenda.diaSemana})`);

        // Map DiaSemana enum to JS getDay() (0=Sunday, 1=Monday...)
        const diaMap: Record<string, number> = {
            'DOMINGO': 0, 'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6
        };

        const targetDay = diaMap[agenda.diaSemana];

        // Iterate dates
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (currentDate.getDay() === targetDay) {
                // Matches the day of the week! Generate slots.

                // Parse times (simple HH:mm parsing)
                const [startHour, startMin] = agenda.horaInicio.split(':').map(Number);
                const [endHour, endMin] = agenda.horaFin.split(':').map(Number);

                // Create time objects for loop
                let slotTime = new Date(currentDate);
                slotTime.setHours(startHour, startMin, 0, 0);

                const endTime = new Date(currentDate);
                endTime.setHours(endHour, endMin, 0, 0);

                while (slotTime < endTime) {
                    // Calculate slot end time
                    const slotEndTime = new Date(slotTime);
                    slotEndTime.setMinutes(slotEndTime.getMinutes() + agenda.duracionSlot);

                    if (slotEndTime > endTime) break;

                    // Format HH:mm
                    const hh = slotTime.getHours().toString().padStart(2, '0');
                    const mm = slotTime.getMinutes().toString().padStart(2, '0');
                    const hhEnd = slotEndTime.getHours().toString().padStart(2, '0');
                    const mmEnd = slotEndTime.getMinutes().toString().padStart(2, '0');

                    // Create Slot if not exists
                    try {
                        await prisma.slot.create({
                            data: {
                                agendaId: agenda.id,
                                fecha: currentDate,
                                horaInicio: `${hh}:${mm}`,
                                horaFin: `${hhEnd}:${mmEnd}`,
                                estado: 'DISPONIBLE'
                            }
                        });
                        process.stdout.write('.');
                        totalSlots++;
                    } catch (e) {
                        // Likely duplicate unique constraint, ignore
                        process.stdout.write('s');
                    }

                    // Next slot
                    slotTime = slotEndTime;
                }
            }
            // Next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    console.log(`\n\n✅ Successfully created ${totalSlots} new slots!`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
