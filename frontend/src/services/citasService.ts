import api from './api';
import { ApiResponse, PaginatedResponse, Cita } from '../types';

export interface CreateCitaData {
  slotId: string;
  pacienteId: string;
  motivoConsulta?: string;
  sintomas?: string;
}

export interface UpdateCitaData {
  estado?: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_ASISTIO';
  motivoConsulta?: string;
  sintomas?: string;
}

export const citasService = {
  getAll: async (page = 1, limit = 10, filters?: { estado?: string; fecha?: string }): Promise<PaginatedResponse<Cita>> => {
    const response = await api.get<PaginatedResponse<Cita>>('/citas', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Cita>> => {
    const response = await api.get<ApiResponse<Cita>>(`/citas/${id}`);
    return response.data;
  },

  create: async (data: CreateCitaData): Promise<ApiResponse<Cita>> => {
    const response = await api.post<ApiResponse<Cita>>('/citas', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCitaData): Promise<ApiResponse<Cita>> => {
    const response = await api.put<ApiResponse<Cita>>(`/citas/${id}`, data);
    return response.data;
  },

  confirm: async (id: string): Promise<ApiResponse<Cita>> => {
    const response = await api.post<ApiResponse<Cita>>(`/citas/${id}/confirm`);
    return response.data;
  },

  cancel: async (id: string, motivo?: string): Promise<ApiResponse<Cita>> => {
    const response = await api.post<ApiResponse<Cita>>(`/citas/${id}/cancel`, { motivo });
    return response.data;
  },

  complete: async (id: string): Promise<ApiResponse<Cita>> => {
    const response = await api.post<ApiResponse<Cita>>(`/citas/${id}/complete`);
    return response.data;
  },

  noShow: async (id: string): Promise<ApiResponse<Cita>> => {
    const response = await api.post<ApiResponse<Cita>>(`/citas/${id}/no-show`);
    return response.data;
  },
};
