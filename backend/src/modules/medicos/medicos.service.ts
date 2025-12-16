import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateMedicoDTO, UpdateMedicoDTO } from './medicos.dto';

export class MedicosService {
  async create(data: CreateMedicoDTO) {
    const existing = await prisma.medico.findUnique({
      where: { numeroLicencia: data.numeroLicencia },
    });

    if (existing) {
      throw new AppError('Medical license already exists', 400);
    }

    return await prisma.medico.create({
      data,
      include: {
        user: { select: { username: true, email: true } },
        especialidad: true,
        entidadMedica: true,
      },
    });
  }

  async findAll(entidadMedicaId?: string) {
    const where = entidadMedicaId ? { entidadMedicaId } : {};

    return await prisma.medico.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, email: true } },
        especialidad: true,
        entidadMedica: { select: { id: true, nombre: true } },
        _count: { select: { agendas: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const medico = await prisma.medico.findUnique({
      where: { id },
      include: {
        user: true,
        especialidad: true,
        entidadMedica: true,
        agendas: {
          where: { activa: true },
          include: {
            _count: { select: { slots: true } },
          },
        },
      },
    });

    if (!medico) {
      throw new AppError('Medico not found', 404);
    }

    return medico;
  }

  async update(id: string, data: UpdateMedicoDTO) {
    const existingMedico = await this.findById(id);

    // Separate user data from medico data
    const { username, email, telefono, ...medicoData } = data;
    const userData: any = {};
    if (username) userData.username = username;
    if (email) userData.email = email;
    if (telefono) userData.telefono = telefono;

    // Use transaction to update both if needed
    return await prisma.$transaction(async (tx) => {
      // Update User if there are user fields
      if (Object.keys(userData).length > 0) {
        // Check for unique constraints if changing email/username? 
        // Prisma will throw error if unique constraint violated, catching it at controller/global filter is fine usually,
        // but let's be safe. For now, trusting Prisma error handling.
        await tx.user.update({
          where: { id: existingMedico.userId },
          data: userData,
        });
      }

      // Update Medico
      const updatedMedico = await tx.medico.update({
        where: { id },
        data: medicoData,
        include: {
          user: { select: { id: true, username: true, email: true, telefono: true } },
          especialidad: true,
          entidadMedica: { select: { id: true, nombre: true } },
        },
      });

      return updatedMedico;
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return await prisma.medico.update({
      where: { id },
      data: { activo: false },
    });
  }

  async activate(id: string) {
    await this.findById(id);
    return await prisma.medico.update({
      where: { id },
      data: { activo: true },
    });
  }
}

export const medicosService = new MedicosService();
