// User types
export interface User {
  id: string;
  username: string;
  email: string;
  rol: 'SUPERADMIN' | 'ADMIN_ENTIDAD' | 'MEDICO' | 'PACIENTE';
  telefono?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Entity types
export interface EntidadMedica {
  id: string;
  nombre: string;
  tipoEntidad: 'HOSPITAL' | 'CLINICA' | 'IPS' | 'CONSULTORIO' | 'LABORATORIO';
  nitRut: string;
  direccion: string;
  ciudad: string;
  departamentoEstado: string;
  telefonoPrincipal: string;
  email: string;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

// Paciente types
export interface Paciente {
  id: string;
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
  activo: boolean;
}

// Especialidad types
export interface Especialidad {
  id: string;
  nombre: string;
  duracionCita: number;
  descripcion?: string;
  activa: boolean;
}

// Medico types
export interface Medico {
  id: string;
  userId: string;
  entidadMedicaId: string;
  especialidadId: string;
  numeroLicencia: string;
  activo: boolean;
  user?: User;
  especialidad?: Especialidad;
  _count?: {
    agendas: number;
  };
}

// Agenda types
export interface Agenda {
  id: string;
  medicoId: string;
  entidadMedicaId: string;
  nombre: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  duracionSlot: number;
  activa: boolean;
  medico?: Medico;
  entidadMedica?: EntidadMedica;
}

// Slot types
export interface Slot {
  id: string;
  agendaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'DISPONIBLE' | 'RESERVADO' | 'CONFIRMADO' | 'CANCELADO' | 'BLOQUEADO';
  agenda?: Agenda;
}

// Cita types
export interface Cita {
  id: string;
  slotId: string;
  pacienteId: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_ASISTIO';
  motivoConsulta?: string;
  sintomas?: string;
  createdAt: string;
  updatedAt: string;
  slot?: Slot;
  paciente?: Paciente;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
