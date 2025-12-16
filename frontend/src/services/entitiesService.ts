import api from './api';
import { ApiResponse, PaginatedResponse, EntidadMedica } from '../types';

export interface CreateEntityData {
  nombre: string;
  tipoEntidad: 'HOSPITAL' | 'CLINICA' | 'IPS' | 'CONSULTORIO' | 'LABORATORIO';
  nitRut: string;
  direccion: string;
  ciudad: string;
  departamentoEstado: string;
  telefonoPrincipal: string;
  email: string;
}

export interface UpdateEntityData extends Partial<CreateEntityData> {
  activa?: boolean;
}

export const entitiesService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<EntidadMedica>> => {
    const response = await api.get<PaginatedResponse<EntidadMedica>>('/entities', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<EntidadMedica>> => {
    const response = await api.get<ApiResponse<EntidadMedica>>(`/entities/${id}`);
    return response.data;
  },

  create: async (data: CreateEntityData): Promise<ApiResponse<EntidadMedica>> => {
    const response = await api.post<ApiResponse<EntidadMedica>>('/entities', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEntityData): Promise<ApiResponse<EntidadMedica>> => {
    const response = await api.put<ApiResponse<EntidadMedica>>(`/entities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/entities/${id}`);
    return response.data;
  },
};
