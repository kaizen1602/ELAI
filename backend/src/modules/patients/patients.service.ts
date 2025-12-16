import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreatePacienteDTO, UpdatePacienteDTO, QueryPacientesDTO } from './patients.dto';

export class PatientsService {
  async create(data: CreatePacienteDTO) {
    // Check if patient already exists
    const existing = await prisma.paciente.findFirst({
      where: {
        entidadMedicaId: data.entidadMedicaId,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
      },
    });

    if (existing) {
      throw new AppError('Patient with this document already exists', 400);
    }

    const paciente = await prisma.paciente.create({ data });
    return paciente;
  }

  async findAll(query: QueryPacientesDTO) {
    const { page, limit, search, entidadMedicaId, activo } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (entidadMedicaId) {
      where.entidadMedicaId = entidadMedicaId;
    }

    if (search) {
      where.OR = [
        { nombres: { contains: search, mode: 'insensitive' } },
        { apellidos: { contains: search, mode: 'insensitive' } },
        { numeroDocumento: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (activo !== undefined) {
      where.activo = activo;
    }

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          entidadMedica: {
            select: {
              id: true,
              nombre: true,
            },
          },
          _count: {
            select: {
              citas: true,
            },
          },
        },
      }),
      prisma.paciente.count({ where }),
    ]);

    return {
      data: pacientes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        entidadMedica: true,
        citas: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            slot: {
              include: {
                agenda: {
                  include: {
                    medico: {
                      include: {
                        user: {
                          select: {
                            username: true,
                          },
                        },
                        especialidad: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!paciente) {
      throw new AppError('Patient not found', 404);
    }

    return paciente;
  }

  async update(id: string, data: UpdatePacienteDTO) {
    await this.findById(id);

    const paciente = await prisma.paciente.update({
      where: { id },
      data,
    });

    return paciente;
  }

  async delete(id: string) {
    await this.findById(id);

    const paciente = await prisma.paciente.update({
      where: { id },
      data: { activo: false },
    });

    return paciente;
  }
}

export const patientsService = new PatientsService();
