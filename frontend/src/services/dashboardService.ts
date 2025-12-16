import api from './api';
import { ApiResponse } from '../types';

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

export interface AppointmentByDate {
  fecha: string;
  count: number;
}

export const dashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },

  getRecentAppointments: async (limit: number = 10): Promise<ApiResponse<CitaReciente[]>> => {
    const response = await api.get<ApiResponse<CitaReciente[]>>('/dashboard/recent-appointments', {
      params: { limit },
    });
    return response.data;
  },

  getAppointmentsByDate: async (startDate?: string, endDate?: string): Promise<ApiResponse<AppointmentByDate[]>> => {
    const response = await api.get<ApiResponse<AppointmentByDate[]>>('/dashboard/appointments-by-date', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
