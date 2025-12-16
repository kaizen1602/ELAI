import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding rich citas...');

    // 1. Get existing data
    const paciente = await prisma.paciente.findFirst();
    const medico = await prisma.medico.findFirst({
        include: { agendas: { include: { slots: true } } }
    });

    if (!paciente || !medico) {
        console.error('Need at least one patient and one doctor with agenda to seed citas.');
        return;
    }

    // 2. Find available slots or create new ones if needed (simplifying to use existing slots)
    // We'll try to find available slots in the doctor's agenda
    let slots = await prisma.slot.findMany({
        where: {
            agenda: { medicoId: medico.id },
            estado: 'DISPONIBLE'
        },
        take: 3
    });

    if (slots.length === 0) {
        console.log('No available slots found. Please generate slots for the doctor first.');
        // Attempting to reset some slots for demo purposes if any exist
        const allSlots = await prisma.slot.findMany({
            where: { agenda: { medicoId: medico.id } },
            take: 3
        });
        if (allSlots.length > 0) {
            // Force free them
            await prisma.slot.updateMany({
                where: { id: { in: allSlots.map(s => s.id) } },
                data: { estado: 'DISPONIBLE' }
            });
            await prisma.cita.deleteMany({
                where: { slotId: { in: allSlots.map(s => s.id) } }
            });
            slots = allSlots;
        }
    }

    // 3. Create Citas with Symptoms
    const scenarios = [
        {
            motivo: "Dolor de cabeza persistente",
            sintomas: "Cefalea intensa, sensibilidad a la luz, náuseas ocasionales desde hace 3 días.",
            estado: "PENDIENTE" as const
        },
        {
            motivo: "Control de hipertensión",
            sintomas: "Mareos leves al levantarse, zumbido en los oídos. Presión arterial promedia 140/90.",
            estado: "CONFIRMADA" as const
        },
        {
            motivo: "Consulta general",
            sintomas: "Fatiga generalizada, dolor muscular sin causa aparente, fiebre leve nocturna.",
            estado: "COMPLETADA" as const
        }
    ];

    for (let i = 0; i < Math.min(slots.length, scenarios.length); i++) {
        const slot = slots[i];
        const scenario = scenarios[i];

        try {
            await prisma.cita.create({
                data: {
                    slotId: slot.id,
                    pacienteId: paciente.id,
                    estado: scenario.estado,
                    motivoConsulta: scenario.motivo,
                    sintomas: scenario.sintomas,
                    notas: "Cita generada automáticamente para pruebas de UI."
                }
            });

            // Update slot status
            await prisma.slot.update({
                where: { id: slot.id },
                data: { estado: scenario.estado === 'PENDIENTE' ? 'RESERVADO' : scenario.estado === 'CONFIRMADA' ? 'CONFIRMADO' : 'BLOQUEADO' }
            });

            console.log(`Created cita with symptoms: ${scenario.sintomas}`);
        } catch (e) {
            console.error('Error creating cita:', e);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
