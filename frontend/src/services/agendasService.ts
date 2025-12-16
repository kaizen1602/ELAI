import api from './api';
import { ApiResponse, PaginatedResponse, Agenda, Slot } from '../types';

export interface CreateAgendaData {
  medicoId: string;
  entidadMedicaId: string;
  nombre: string;
  diaSemana: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';
  horaInicio: string;
  horaFin: string;
  duracionSlot: number;
}

export interface UpdateAgendaData extends Partial<CreateAgendaData> {
  activa?: boolean;
}

export const agendasService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Agenda>> => {
    const response = await api.get<PaginatedResponse<Agenda>>('/agendas', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Agenda>> => {
    const response = await api.get<ApiResponse<Agenda>>(`/agendas/${id}`);
    return response.data;
  },

  create: async (data: CreateAgendaData): Promise<ApiResponse<Agenda>> => {
    const response = await api.post<ApiResponse<Agenda>>('/agendas', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAgendaData): Promise<ApiResponse<Agenda>> => {
    const response = await api.put<ApiResponse<Agenda>>(`/agendas/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/agendas/${id}`);
    return response.data;
  },

  generateSlots: async (id: string, fechaInicio: string, fechaFin: string): Promise<ApiResponse<Slot[]>> => {
    const response = await api.post<ApiResponse<Slot[]>>(`/agendas/${id}/generate-slots`, {
      fechaInicio,
      fechaFin,
    });
    return response.data;
  },
};

export const slotsService = {
  getAvailable: async (agendaId: string, fecha: string): Promise<ApiResponse<Slot[]>> => {
    const response = await api.get<ApiResponse<Slot[]>>('/slots/available', {
      params: { agendaId, fecha },
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Slot>> => {
    const response = await api.get<ApiResponse<Slot>>(`/slots/${id}`);
    return response.data;
  },

  block: async (id: string, motivo?: string): Promise<ApiResponse<Slot>> => {
    const response = await api.patch<ApiResponse<Slot>>(`/slots/${id}/block`, { motivo });
    return response.data;
  },

  unblock: async (id: string): Promise<ApiResponse<Slot>> => {
    const response = await api.patch<ApiResponse<Slot>>(`/slots/${id}/unblock`);
    return response.data;
  },
};
