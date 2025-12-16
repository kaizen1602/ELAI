import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateCitaDTO, UpdateCitaDTO, QueryCitasDTO } from './citas.dto';
import { logger } from '../../utils/logger';

export class CitasService {
  /**
   * Create new appointment
   */
  async create(data: CreateCitaDTO) {
    // Verify slot exists and is available or reserved
    const slot = await prisma.slot.findUnique({
      where: { id: data.slotId },
      include: { lock: true, cita: true },
    });

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    if (slot.cita) {
      throw new AppError('Slot already has an appointment', 400);
    }

    if (slot.estado !== 'RESERVADO' && slot.estado !== 'DISPONIBLE') {
      throw new AppError(`Slot is not available (current state: ${slot.estado})`, 400);
    }

    // Verify patient exists
    const paciente = await prisma.paciente.findUnique({
      where: { id: data.pacienteId },
    });

    if (!paciente) {
      throw new AppError('Patient not found', 404);
    }

    // Create appointment in transaction
    const cita = await prisma.$transaction(async (tx) => {
      // Create the appointment (CONFIRMADA since user already confirmed via bot)
      const newCita = await tx.cita.create({
        data: {
          slotId: data.slotId,
          pacienteId: data.pacienteId,
          motivoConsulta: data.motivoConsulta,
          sintomas: data.sintomas,
          notas: data.notas,
          estado: 'CONFIRMADA', // Changed from PENDIENTE - user confirmed via bot
        },
        include: {
          slot: {
            include: {
              agenda: {
                include: {
                  medico: {
                    include: {
                      user: { select: { id: true, username: true, email: true } },
                      especialidad: true,
                    },
                  },
                  entidadMedica: true,
                },
              },
            },
          },
          paciente: true,
        },
      });

      // Update slot status
      await tx.slot.update({
        where: { id: data.slotId },
        data: { estado: 'CONFIRMADO' },
      });

      // Remove lock if exists
      await tx.slotLock.deleteMany({
        where: { slotId: data.slotId },
      });

      return newCita;
    });

    logger.info(`Appointment ${cita.id} created for patient ${data.pacienteId}`);

    return cita;
  }

  /**
   * Get all appointments with filters and pagination
   */
  async findAll(query: QueryCitasDTO) {
    const { page, limit, pacienteId, medicoId, entidadMedicaId, estado, fechaInicio, fechaFin } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (pacienteId) where.pacienteId = pacienteId;
    if (estado) where.estado = estado;

    if (medicoId) {
      where.slot = {
        agenda: {
          medicoId,
        },
      };
    }

    if (entidadMedicaId) {
      where.slot = {
        ...where.slot,
        agenda: {
          ...where.slot?.agenda,
          entidadMedicaId,
        },
      };
    }

    if (fechaInicio || fechaFin) {
      where.slot = {
        ...where.slot,
        fecha: {},
      };
      if (fechaInicio) where.slot.fecha.gte = fechaInicio;
      if (fechaFin) where.slot.fecha.lte = fechaFin;
    }

    const [citas, total] = await Promise.all([
      prisma.cita.findMany({
        where,
        skip,
        take: limit,
        include: {
          slot: {
            include: {
              agenda: {
                include: {
                  medico: {
                    include: {
                      user: { select: { id: true, username: true } },
                      especialidad: true,
                    },
                  },
                },
              },
            },
          },
          paciente: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cita.count({ where }),
    ]);

    return {
      data: citas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get appointment by ID
   */
  async findById(id: string) {
    const cita = await prisma.cita.findUnique({
      where: { id },
      include: {
        slot: {
          include: {
            agenda: {
              include: {
                medico: {
                  include: {
                    user: { select: { id: true, username: true, email: true, telefono: true } },
                    especialidad: true,
                  },
                },
                entidadMedica: true,
              },
            },
          },
        },
        paciente: true,
      },
    });

    if (!cita) {
      throw new AppError('Appointment not found', 404);
    }

    return cita;
  }

  /**
   * Update appointment
   */
  async update(id: string, data: UpdateCitaDTO) {
    await this.findById(id);

    return await prisma.cita.update({
      where: { id },
      data,
      include: {
        slot: {
          include: {
            agenda: {
              include: {
                medico: {
                  include: {
                    user: { select: { username: true } },
                    especialidad: true,
                  },
                },
              },
            },
          },
        },
        paciente: true,
      },
    });
  }

  /**
   * Cancel appointment
   */
  async cancel(id: string, motivo?: string) {
    const cita = await this.findById(id);

    if (cita.estado === 'CANCELADA') {
      throw new AppError('Appointment is already cancelled', 400);
    }

    if (cita.estado === 'COMPLETADA') {
      throw new AppError('Cannot cancel completed appointment', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update appointment
      const cancelledCita = await tx.cita.update({
        where: { id },
        data: {
          estado: 'CANCELADA',
          notas: motivo ? `${cita.notas || ''}\n[CANCELLED] ${motivo}`.trim() : cita.notas,
        },
      });

      // Free the slot
      await tx.slot.update({
        where: { id: cita.slotId },
        data: { estado: 'DISPONIBLE' },
      });

      return cancelledCita;
    });

    logger.info(`Appointment ${id} cancelled`);

    return updated;
  }

  /**
   * Confirm appointment
   */
  async confirm(id: string) {
    const cita = await this.findById(id);

    if (cita.estado !== 'PENDIENTE') {
      throw new AppError(`Cannot confirm appointment with status ${cita.estado}`, 400);
    }

    const updated = await prisma.cita.update({
      where: { id },
      data: { estado: 'CONFIRMADA' },
    });

    logger.info(`Appointment ${id} confirmed`);

    return updated;
  }

  /**
   * Mark appointment as completed
   */
  async complete(id: string) {
    const cita = await this.findById(id);

    if (cita.estado === 'CANCELADA' || cita.estado === 'NO_ASISTIO') {
      throw new AppError(`Cannot complete appointment with status ${cita.estado}`, 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const completedCita = await tx.cita.update({
        where: { id },
        data: { estado: 'COMPLETADA' },
      });

      await tx.slot.update({
        where: { id: cita.slotId },
        data: { estado: 'BLOQUEADO' },
      });

      return completedCita;
    });

    logger.info(`Appointment ${id} completed`);

    return updated;
  }

  /**
   * Mark appointment as no-show
   */
  async noShow(id: string) {
    const cita = await this.findById(id);

    if (cita.estado === 'CANCELADA' || cita.estado === 'COMPLETADA') {
      throw new AppError(`Cannot mark as no-show: appointment has status ${cita.estado}`, 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const noShowCita = await tx.cita.update({
        where: { id },
        data: { estado: 'NO_ASISTIO' },
      });

      await tx.slot.update({
        where: { id: cita.slotId },
        data: { estado: 'BLOQUEADO' },
      });

      return noShowCita;
    });

    logger.info(`Appointment ${id} marked as no-show`);

    return updated;
  }
}

export const citasService = new CitasService();
