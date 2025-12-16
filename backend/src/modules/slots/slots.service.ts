import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateSlotDTO, UpdateSlotDTO, QueryAvailableSlotsDTO } from './slots.dto';
import { logger } from '../../utils/logger';

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export class SlotsService {
  /**
   * Lock a slot for booking (for N8N)
   */
  async lockSlot(slotId: string, sessionId: string) {
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { lock: true },
    });

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    if (slot.estado !== 'DISPONIBLE') {
      throw new AppError(`Slot is not available (current state: ${slot.estado})`, 400);
    }

    // Check if already locked by another session
    if (slot.lock && slot.lock.expiresAt > new Date()) {
      if (slot.lock.sessionId !== sessionId) {
        throw new AppError('Slot is locked by another user', 409);
      }
      // Same session - extend lock
      const lock = await prisma.slotLock.update({
        where: { slotId },
        data: { expiresAt: new Date(Date.now() + LOCK_DURATION_MS) },
      });
      return lock;
    }

    // Create or update lock
    const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);

    const lock = await prisma.slotLock.upsert({
      where: { slotId },
      create: { slotId, sessionId, expiresAt },
      update: { sessionId, expiresAt },
    });

    // Update slot status
    await prisma.slot.update({
      where: { id: slotId },
      data: { estado: 'RESERVADO' },
    });

    logger.info(`Slot ${slotId} locked by session ${sessionId}`);

    return lock;
  }

  /**
   * Unlock a slot
   */
  async unlockSlot(slotId: string) {
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { lock: true, cita: true },
    });

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    // Don't unlock if there's an appointment
    if (slot.cita) {
      throw new AppError('Cannot unlock slot with an appointment', 400);
    }

    // Delete lock
    if (slot.lock) {
      await prisma.slotLock.delete({ where: { slotId } });
    }

    // Reset slot status
    await prisma.slot.update({
      where: { id: slotId },
      data: { estado: 'DISPONIBLE' },
    });

    logger.info(`Slot ${slotId} unlocked`);
  }

  /**
   * Get available slots
   */
  async getAvailableSlots(query: QueryAvailableSlotsDTO) {
    const { agendaId, entidadMedicaId, categoria, fecha, fechaInicio, fechaFin } = query;

    const where: any = {
      estado: 'DISPONIBLE',
    };

    if (agendaId) {
      where.agendaId = agendaId;
    } else if (entidadMedicaId) {
      // Filter filtering by Entity and optionally Category
      where.agenda = {
        entidadMedicaId,
        activa: true
      };

      if (categoria) {
        where.agenda.medico = {
            especialidad: {
                nombre: { contains: categoria, mode: 'insensitive' }
            }
        };
      }
    }

    if (fecha) {
      where.fecha = fecha;
    } else if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = fechaInicio;
      if (fechaFin) where.fecha.lte = fechaFin;
    } else {
      // Default: from today
      where.fecha = { gte: new Date() };
    }

    // Clean expired locks first
    await this.cleanExpiredLocks();

    return await prisma.slot.findMany({
      where,
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
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
    });
  }

  /**
   * Create a new slot
   */
  async create(data: CreateSlotDTO) {
    // Verify agenda exists
    const agenda = await prisma.agenda.findUnique({
      where: { id: data.agendaId },
    });

    if (!agenda) {
      throw new AppError('Agenda not found', 404);
    }

    // Check for overlapping slot
    const existingSlot = await prisma.slot.findFirst({
      where: {
        agendaId: data.agendaId,
        fecha: data.fecha,
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
        ],
      },
    });

    if (existingSlot) {
      throw new AppError('Slot overlaps with existing slot', 400);
    }

    return await prisma.slot.create({
      data,
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
    });
  }

  /**
   * Get slot by ID
   */
  async findById(id: string) {
    console.log('🔍 [SlotsService] findById searching for:', id);
    const slot = await prisma.slot.findUnique({
      where: { id },
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
        cita: {
          include: {
            paciente: true,
          },
        },
        lock: true,
      },
    });

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    return slot;
  }

  /**
   * Update slot
   */
  async update(id: string, data: UpdateSlotDTO) {
    const slot = await this.findById(id);

    // Can't update if has appointment (except notes)
    if (slot.cita && data.estado) {
      throw new AppError('Cannot change status of slot with appointment', 400);
    }

    return await prisma.slot.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete slot (only if not booked)
   */
  async delete(id: string) {
    const slot = await this.findById(id);

    if (slot.cita) {
      throw new AppError('Cannot delete slot with an appointment', 400);
    }

    // Delete lock if exists
    if (slot.lock) {
      await prisma.slotLock.delete({ where: { slotId: id } });
    }

    await prisma.slot.delete({ where: { id } });

    logger.info(`Slot ${id} deleted`);
  }

  /**
   * Clean expired locks (called periodically)
   */
  private async cleanExpiredLocks() {
    const result = await prisma.$transaction(async (tx) => {
      // Find expired locks
      const expiredLocks = await tx.slotLock.findMany({
        where: {
          expiresAt: { lt: new Date() },
        },
        select: { slotId: true },
      });

      if (expiredLocks.length === 0) return 0;

      // Delete expired locks
      await tx.slotLock.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      // Reset slot states
      await tx.slot.updateMany({
        where: {
          id: { in: expiredLocks.map((l) => l.slotId) },
          estado: 'RESERVADO',
        },
        data: { estado: 'DISPONIBLE' },
      });

      return expiredLocks.length;
    });

    if (result > 0) {
      logger.info(`Cleaned ${result} expired slot locks`);
    }

    return result;
  }
}

export const slotsService = new SlotsService();
