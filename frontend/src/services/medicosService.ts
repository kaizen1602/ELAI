import api from './api';
import { ApiResponse, Medico, Especialidad } from '../types';

export interface CreateMedicoData {
  userId: string;
  entidadMedicaId: string;
  especialidadId: string;
  numeroLicencia: string;
}

export interface UpdateMedicoData {
  entidadMedicaId?: string;
  especialidadId?: string;
  numeroLicencia?: string;
  activo?: boolean;
  username?: string;
  email?: string;
  telefono?: string;
}

export const medicosService = {
  getAll: async (entidadMedicaId?: string): Promise<ApiResponse<Medico[]>> => {
    const response = await api.get<ApiResponse<Medico[]>>('/medicos', {
      params: entidadMedicaId ? { entidadMedicaId } : {},
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Medico>> => {
    const response = await api.get<ApiResponse<Medico>>(`/medicos/${id}`);
    return response.data;
  },

  create: async (data: CreateMedicoData): Promise<ApiResponse<Medico>> => {
    const response = await api.post<ApiResponse<Medico>>('/medicos', data);
    return response.data;
  },

  update: async (id: string, data: UpdateMedicoData): Promise<ApiResponse<Medico>> => {
    const response = await api.put<ApiResponse<Medico>>(`/medicos/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/medicos/${id}`);
    return response.data;
  },
};

export const especialidadesService = {
  getAll: async (): Promise<ApiResponse<Especialidad[]>> => {
    const response = await api.get<ApiResponse<Especialidad[]>>('/especialidades');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Especialidad>> => {
    const response = await api.get<ApiResponse<Especialidad>>(`/especialidades/${id}`);
    return response.data;
  },

  create: async (data: { nombre: string; duracionCita: number; descripcion?: string }): Promise<ApiResponse<Especialidad>> => {
    const response = await api.post<ApiResponse<Especialidad>>('/especialidades', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Especialidad>): Promise<ApiResponse<Especialidad>> => {
    const response = await api.put<ApiResponse<Especialidad>>(`/especialidades/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/especialidades/${id}`);
    return response.data;
  },
};
