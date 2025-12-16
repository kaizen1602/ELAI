import { prisma } from '../../config/database';
import { AuthenticatedRequest } from '../../types';
import { UserRole } from '@prisma/client';

export interface DashboardStats {
  totalPacientes: number;
  totalEntidades: number;
  totalCitas: number;
  totalAgendas: number;
  totalMedicos: number;
  citasHoy: number;
  citasPendientes: number;
  citasConfirmadas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  slotsDisponiblesHoy: number;
}

export interface CitaReciente {
  id: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  estado: string;
  paciente: {
    nombres: string;
    apellidos: string;
    numeroDocumento: string;
  };
  medico: {
    user: {
      username: string;
    };
    especialidad: {
      nombre: string;
    };
  };
}

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats(req: AuthenticatedRequest): Promise<DashboardStats> {
    const user = req.user!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build filters based on user role
    let pacienteFilter: any = {};
    let citaFilter: any = {};
    let agendaFilter: any = {};
    let medicoFilter: any = {};
    let entidadFilter: any = {};
    let slotFilter: any = {};

    if (user.rol === UserRole.ADMIN_ENTIDAD) {
      // Admin can only see their entity data
      const adminEntidad = await prisma.adminEntidad.findUnique({
        where: { userId: user.id },
      });

      if (adminEntidad) {
        const entidadId = adminEntidad.entidadMedicaId;
        pacienteFilter = { entidadMedicaId: entidadId };
        citaFilter = { slot: { agenda: { entidadMedicaId: entidadId } } };
        agendaFilter = { entidadMedicaId: entidadId };
        medicoFilter = { entidadMedicaId: entidadId };
        entidadFilter = { id: entidadId };
        slotFilter = { agenda: { entidadMedicaId: entidadId } };
      }
    } else if (user.rol === UserRole.MEDICO) {
      // Medico can only see their own data
      const medico = await prisma.medico.findUnique({
        where: { userId: user.id },
      });

      if (medico) {
        agendaFilter = { medicoId: medico.id };
        citaFilter = { slot: { agenda: { medicoId: medico.id } } };
        slotFilter = { agenda: { medicoId: medico.id } };
        medicoFilter = { id: medico.id };
        entidadFilter = { id: medico.entidadMedicaId };
        pacienteFilter = { entidadMedicaId: medico.entidadMedicaId };
      }
    }
    // SUPERADMIN sees everything (no filters)

    // Execute all counts in parallel for better performance
    const [
      totalPacientes,
      totalEntidades,
      totalCitas,
      totalAgendas,
      totalMedicos,
      citasHoy,
      citasPendientes,
      citasConfirmadas,
      citasCompletadas,
      citasCanceladas,
      slotsDisponiblesHoy,
    ] = await Promise.all([
      prisma.paciente.count({ where: { ...pacienteFilter, activo: true } }),
      prisma.entidadMedica.count({ where: { ...entidadFilter, activa: true } }),
      prisma.cita.count({ where: citaFilter }),
      prisma.agenda.count({ where: { ...agendaFilter, activa: true } }),
      prisma.medico.count({ where: { ...medicoFilter, activo: true } }),
      prisma.cita.count({
        where: {
          ...citaFilter,
          slot: {
            fecha: {
              gte: today,
              lt: tomorrow,
            },
            ...slotFilter,
          },
        },
      }),
      prisma.cita.count({
        where: {
          ...citaFilter,
          estado: 'PENDIENTE',
        },
      }),
      prisma.cita.count({
        where: {
          ...citaFilter,
          estado: 'CONFIRMADA',
        },
      }),
      prisma.cita.count({
        where: {
          ...citaFilter,
          estado: 'COMPLETADA',
        },
      }),
      prisma.cita.count({
        where: {
          ...citaFilter,
          estado: 'CANCELADA',
        },
      }),
      prisma.slot.count({
        where: {
          ...slotFilter,
          fecha: {
            gte: today,
            lt: tomorrow,
          },
          estado: 'DISPONIBLE',
        },
      }),
    ]);

    return {
      totalPacientes,
      totalEntidades,
      totalCitas,
      totalAgendas,
      totalMedicos,
      citasHoy,
      citasPendientes,
      citasConfirmadas,
      citasCompletadas,
      citasCanceladas,
      slotsDisponiblesHoy,
    };
  }

  /**
   * Get recent appointments
   */
  async getRecentAppointments(req: AuthenticatedRequest, limit: number = 10): Promise<CitaReciente[]> {
    const user = req.user!;
    let citaFilter: any = {};

    if (user.rol === UserRole.ADMIN_ENTIDAD) {
      const adminEntidad = await prisma.adminEntidad.findUnique({
        where: { userId: user.id },
      });

      if (adminEntidad) {
        citaFilter = { slot: { agenda: { entidadMedicaId: adminEntidad.entidadMedicaId } } };
      }
    } else if (user.rol === UserRole.MEDICO) {
      const medico = await prisma.medico.findUnique({
        where: { userId: user.id },
      });

      if (medico) {
        citaFilter = { slot: { agenda: { medicoId: medico.id } } };
      }
    }

    const citas = await prisma.cita.findMany({
      where: citaFilter,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        paciente: {
          select: {
            nombres: true,
            apellidos: true,
            numeroDocumento: true,
          },
        },
        slot: {
          include: {
            agenda: {
              include: {
                medico: {
                  include: {
                    user: {
                      select: { username: true },
                    },
                    especialidad: {
                      select: { nombre: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return citas.map((cita) => ({
      id: cita.id,
      fecha: cita.slot.fecha,
      horaInicio: cita.slot.horaInicio,
      horaFin: cita.slot.horaFin,
      estado: cita.estado,
      paciente: cita.paciente,
      medico: {
        user: cita.slot.agenda.medico.user,
        especialidad: cita.slot.agenda.medico.especialidad,
      },
    }));
  }

  /**
   * Get appointments by date range (for charts)
   */
  async getAppointmentsByDateRange(
    req: AuthenticatedRequest,
    startDate: Date,
    endDate: Date
  ): Promise<{ fecha: string; count: number }[]> {
    const user = req.user!;
    let citaFilter: any = {};

    if (user.rol === UserRole.ADMIN_ENTIDAD) {
      const adminEntidad = await prisma.adminEntidad.findUnique({
        where: { userId: user.id },
      });

      if (adminEntidad) {
        citaFilter = { slot: { agenda: { entidadMedicaId: adminEntidad.entidadMedicaId } } };
      }
    } else if (user.rol === UserRole.MEDICO) {
      const medico = await prisma.medico.findUnique({
        where: { userId: user.id },
      });

      if (medico) {
        citaFilter = { slot: { agenda: { medicoId: medico.id } } };
      }
    }

    const citas = await prisma.cita.findMany({
      where: {
        ...citaFilter,
        slot: {
          fecha: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        slot: {
          select: { fecha: true },
        },
      },
    });

    // Group by date
    const grouped = citas.reduce((acc: Record<string, number>, cita) => {
      const fecha = cita.slot.fecha.toISOString().split('T')[0];
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([fecha, count]) => ({ fecha, count }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
}

export const dashboardService = new DashboardService();
