import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateEspecialidadDTO, UpdateEspecialidadDTO } from './especialidades.dto';

export class EspecialidadesService {
  async create(data: CreateEspecialidadDTO) {
    const existing = await prisma.especialidad.findUnique({
      where: { nombre: data.nombre },
    });

    if (existing) {
      throw new AppError('Especialidad already exists', 400);
    }

    return await prisma.especialidad.create({ data });
  }

  async findAll() {
    return await prisma.especialidad.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { medicos: true },
        },
      },
    });
  }

  async findById(id: string) {
    const especialidad = await prisma.especialidad.findUnique({
      where: { id },
      include: {
        medicos: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
            entidadMedica: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!especialidad) {
      throw new AppError('Especialidad not found', 404);
    }

    return especialidad;
  }

  async update(id: string, data: UpdateEspecialidadDTO) {
    await this.findById(id);
    return await prisma.especialidad.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return await prisma.especialidad.update({
      where: { id },
      data: { activa: false },
    });
  }
}

export const especialidadesService = new EspecialidadesService();
