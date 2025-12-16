import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateEntidadDTO, UpdateEntidadDTO, QueryEntidadesDTO } from './entities.dto';

export class EntitiesService {
  /**
   * Create new medical entity
   */
  async create(data: CreateEntidadDTO) {
    // Check if NIT/RUT already exists
    const existing = await prisma.entidadMedica.findUnique({
      where: { nitRut: data.nitRut },
    });

    if (existing) {
      throw new AppError('Entity with this NIT/RUT already exists', 400);
    }

    const entidad = await prisma.entidadMedica.create({
      data,
    });

    return entidad;
  }

  /**
   * Get all medical entities with pagination
   */
  async findAll(query: QueryEntidadesDTO) {
    const { page, limit, search, tipoEntidad, activa } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { nitRut: { contains: search, mode: 'insensitive' } },
        { ciudad: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tipoEntidad) {
      where.tipoEntidad = tipoEntidad;
    }

    if (activa !== undefined) {
      where.activa = activa;
    }

    const [entidades, total] = await Promise.all([
      prisma.entidadMedica.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              medicos: true,
              pacientes: true,
              agendas: true,
            },
          },
        },
      }),
      prisma.entidadMedica.count({ where }),
    ]);

    return {
      data: entidades,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get medical entity by ID
   */
  async findById(id: string) {
    const entidad = await prisma.entidadMedica.findUnique({
      where: { id },
      include: {
        adminEntidades: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                telefono: true,
              },
            },
          },
        },
        _count: {
          select: {
            medicos: true,
            pacientes: true,
            agendas: true,
            conversaciones: true,
          },
        },
      },
    });

    if (!entidad) {
      throw new AppError('Medical entity not found', 404);
    }

    return entidad;
  }

  /**
   * Update medical entity
   */
  async update(id: string, data: UpdateEntidadDTO) {
    // Check if entity exists
    await this.findById(id);

    // If updating NIT/RUT, check uniqueness
    if (data.nitRut) {
      const existing = await prisma.entidadMedica.findFirst({
        where: {
          nitRut: data.nitRut,
          NOT: { id },
        },
      });

      if (existing) {
        throw new AppError('Entity with this NIT/RUT already exists', 400);
      }
    }

    const entidad = await prisma.entidadMedica.update({
      where: { id },
      data,
    });

    return entidad;
  }

  /**
   * Delete (soft delete - deactivate) medical entity
   */
  async delete(id: string) {
    await this.findById(id);

    const entidad = await prisma.entidadMedica.update({
      where: { id },
      data: { activa: false },
    });

    return entidad;
  }

  /**
   * Activate medical entity
   */
  async activate(id: string) {
    await this.findById(id);

    const entidad = await prisma.entidadMedica.update({
      where: { id },
      data: { activa: true },
    });

    return entidad;
  }

  /**
   * Get entity statistics
   */
  async getStatistics(id: string) {
    await this.findById(id);

    const [
      totalMedicos,
      medicosActivos,
      totalPacientes,
      pacientesActivos,
      totalAgendas,
      agendasActivas,
      totalCitas,
      citasPendientes,
      conversacionesActivas,
    ] = await Promise.all([
      prisma.medico.count({ where: { entidadMedicaId: id } }),
      prisma.medico.count({ where: { entidadMedicaId: id, activo: true } }),
      prisma.paciente.count({ where: { entidadMedicaId: id } }),
      prisma.paciente.count({ where: { entidadMedicaId: id, activo: true } }),
      prisma.agenda.count({ where: { entidadMedicaId: id } }),
      prisma.agenda.count({ where: { entidadMedicaId: id, activa: true } }),
      prisma.cita.count({
        where: {
          slot: {
            agenda: {
              entidadMedicaId: id,
            },
          },
        },
      }),
      prisma.cita.count({
        where: {
          estado: 'PENDIENTE',
          slot: {
            agenda: {
              entidadMedicaId: id,
            },
          },
        },
      }),
      prisma.conversacion.count({
        where: { entidadMedicaId: id, estado: 'ACTIVA' },
      }),
    ]);

    return {
      medicos: {
        total: totalMedicos,
        activos: medicosActivos,
      },
      pacientes: {
        total: totalPacientes,
        activos: pacientesActivos,
      },
      agendas: {
        total: totalAgendas,
        activas: agendasActivas,
      },
      citas: {
        total: totalCitas,
        pendientes: citasPendientes,
      },
      conversaciones: {
        activas: conversacionesActivas,
      },
    };
  }
}

export const entitiesService = new EntitiesService();
