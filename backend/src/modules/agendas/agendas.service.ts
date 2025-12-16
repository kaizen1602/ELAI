import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateAgendaDTO, UpdateAgendaDTO, QueryAgendasDTO, GenerateSlotsDTO } from './agendas.dto';
import { logger } from '../../utils/logger';

export class AgendasService {
  /**
   * Create new agenda
   */
  async create(data: CreateAgendaDTO) {
    // Verify medico exists
    const medico = await prisma.medico.findUnique({
      where: { id: data.medicoId },
    });

    if (!medico) {
      throw new AppError('Medico not found', 404);
    }

    // Verify entity exists
    const entidad = await prisma.entidadMedica.findUnique({
      where: { id: data.entidadMedicaId },
    });

    if (!entidad) {
      throw new AppError('Medical entity not found', 404);
    }

    // Check for conflicting agenda (same medico, same day, overlapping hours)
    const conflictingAgenda = await prisma.agenda.findFirst({
      where: {
        medicoId: data.medicoId,
        diaSemana: data.diaSemana,
        activa: true,
        OR: [
          {
            AND: [
              { horaInicio: { lte: data.horaInicio } },
              { horaFin: { gt: data.horaInicio } },
            ],
          },
          {
            AND: [
              { horaInicio: { lt: data.horaFin } },
              { horaFin: { gte: data.horaFin } },
            ],
          },
          {
            AND: [
              { horaInicio: { gte: data.horaInicio } },
              { horaFin: { lte: data.horaFin } },
            ],
          },
        ],
      },
    });

    if (conflictingAgenda) {
      throw new AppError('Agenda conflicts with existing schedule for this medico', 400);
    }

    return await prisma.agenda.create({
      data,
      include: {
        medico: {
          include: {
            user: { select: { id: true, username: true, email: true } },
            especialidad: true,
          },
        },
        entidadMedica: { select: { id: true, nombre: true } },
      },
    });
  }

  /**
   * Get all agendas with pagination and filters
   */
  async findAll(query: QueryAgendasDTO) {
    const { page, limit, entidadMedicaId, medicoId, diaSemana, activa } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (entidadMedicaId) where.entidadMedicaId = entidadMedicaId;
    if (medicoId) where.medicoId = medicoId;
    if (diaSemana) where.diaSemana = diaSemana;
    if (activa !== undefined) where.activa = activa;

    const [agendas, total] = await Promise.all([
      prisma.agenda.findMany({
        where,
        skip,
        take: limit,
        include: {
          medico: {
            include: {
              user: { select: { id: true, username: true, email: true } },
              especialidad: true,
            },
          },
          entidadMedica: { select: { id: true, nombre: true } },
          _count: { select: { slots: true } },
        },
        orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
      }),
      prisma.agenda.count({ where }),
    ]);

    return {
      data: agendas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get agenda by ID
   */
  async findById(id: string) {
    const agenda = await prisma.agenda.findUnique({
      where: { id },
      include: {
        medico: {
          include: {
            user: { select: { id: true, username: true, email: true, telefono: true } },
            especialidad: true,
          },
        },
        entidadMedica: true,
        slots: {
          where: {
            fecha: { gte: new Date() },
          },
          take: 50,
          orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
          include: {
            cita: {
              include: {
                paciente: { select: { id: true, nombres: true, apellidos: true } },
              },
            },
          },
        },
      },
    });

    if (!agenda) {
      throw new AppError('Agenda not found', 404);
    }

    return agenda;
  }

  /**
   * Update agenda
   */
  async update(id: string, data: UpdateAgendaDTO) {
    await this.findById(id);

    return await prisma.agenda.update({
      where: { id },
      data,
      include: {
        medico: {
          include: {
            user: { select: { id: true, username: true, email: true } },
            especialidad: true,
          },
        },
      },
    });
  }

  /**
   * Deactivate agenda (soft delete)
   */
  async delete(id: string) {
    await this.findById(id);

    // Check for future appointments
    const futureAppointments = await prisma.cita.count({
      where: {
        slot: {
          agendaId: id,
          fecha: { gte: new Date() },
        },
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
    });

    if (futureAppointments > 0) {
      throw new AppError(
        `Cannot deactivate agenda with ${futureAppointments} pending appointments`,
        400
      );
    }

    return await prisma.agenda.update({
      where: { id },
      data: { activa: false },
    });
  }

  /**
   * Activate agenda
   */
  async activate(id: string) {
    const agenda = await prisma.agenda.findUnique({ where: { id } });

    if (!agenda) {
      throw new AppError('Agenda not found', 404);
    }

    return await prisma.agenda.update({
      where: { id },
      data: { activa: true },
    });
  }

  /**
   * Generate slots for a date range
   */
  async generateSlots(data: GenerateSlotsDTO) {
    const agenda = await this.findById(data.agendaId);

    const slots = [];
    const currentDate = new Date(data.fechaInicio);
    const endDate = new Date(data.fechaFin);

    // Map day names to JS getDay() values
    const dayMap: Record<string, number> = {
      DOMINGO: 0,
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
    };

    const targetDay = dayMap[agenda.diaSemana];

    while (currentDate <= endDate) {
      if (currentDate.getDay() === targetDay) {
        // Generate slots for this day
        const [startHour, startMin] = agenda.horaInicio.split(':').map(Number);
        const [endHour, endMin] = agenda.horaFin.split(':').map(Number);

        let slotStart = startHour * 60 + startMin;
        const dayEnd = endHour * 60 + endMin;

        while (slotStart + agenda.duracionSlot <= dayEnd) {
          const slotEnd = slotStart + agenda.duracionSlot;

          const horaInicio = `${Math.floor(slotStart / 60).toString().padStart(2, '0')}:${(slotStart % 60).toString().padStart(2, '0')}`;
          const horaFin = `${Math.floor(slotEnd / 60).toString().padStart(2, '0')}:${(slotEnd % 60).toString().padStart(2, '0')}`;

          slots.push({
            agendaId: agenda.id,
            fecha: new Date(currentDate),
            horaInicio,
            horaFin,
            estado: 'DISPONIBLE' as const,
          });

          slotStart = slotEnd;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (slots.length === 0) {
      throw new AppError('No slots could be generated for the given date range', 400);
    }

    // Create slots, skip duplicates
    const createdSlots = await prisma.$transaction(
      slots.map((slot) =>
        prisma.slot.upsert({
          where: {
            agendaId_fecha_horaInicio: {
              agendaId: slot.agendaId,
              fecha: slot.fecha,
              horaInicio: slot.horaInicio,
            },
          },
          create: slot,
          update: {},
        })
      )
    );

    logger.info(`Generated ${createdSlots.length} slots for agenda ${agenda.id}`);

    return createdSlots;
  }
}

export const agendasService = new AgendasService();
