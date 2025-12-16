import api from './api';
import { ApiResponse, PaginatedResponse, Paciente } from '../types';

export interface CreatePatientData {
  entidadMedicaId: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  email?: string;
  direccion: string;
  ciudad: string;
  departamento: string;
}

export interface UpdatePatientData extends Partial<CreatePatientData> {
  activo?: boolean;
}

export const patientsService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Paciente>> => {
    const response = await api.get<PaginatedResponse<Paciente>>('/patients', {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Paciente>> => {
    const response = await api.get<ApiResponse<Paciente>>(`/patients/${id}`);
    return response.data;
  },

  create: async (data: CreatePatientData): Promise<ApiResponse<Paciente>> => {
    const response = await api.post<ApiResponse<Paciente>>('/patients', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePatientData): Promise<ApiResponse<Paciente>> => {
    const response = await api.put<ApiResponse<Paciente>>(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/patients/${id}`);
    return response.data;
  },
};
