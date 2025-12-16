import { Request } from 'express';
import { UserRole } from '@prisma/client';

// Authenticated User payload from JWT
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  rol: UserRole;
  telefono?: string | null;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Extended Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// API Response types
export interface ApiResponse<T = unknown> {
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

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// Common query params
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// WhatsApp Webhook types
export interface WhatsAppWebhookEntry {
  id: string;
  changes: WhatsAppWebhookChange[];
}

export interface WhatsAppWebhookChange {
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: Array<{
      profile: { name: string };
      wa_id: string;
    }>;
    messages?: Array<{
      from: string;
      id: string;
      timestamp: string;
      type: string;
      text?: { body: string };
    }>;
    statuses?: Array<{
      id: string;
      status: string;
      timestamp: string;
      recipient_id: string;
    }>;
  };
  field: string;
}

export interface WhatsAppWebhookBody {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

// AI Usage types
export type AIModel = 'GPT_4O_MINI' | 'GPT_4' | 'GPT_3_5_TURBO';
export type AIOperationType =
  | 'CLASIFICACION_INTENCION'
  | 'CLASIFICACION_SINTOMAS'
  | 'RESPUESTA_CALIDA'
  | 'AGENTE_CONVERSACIONAL';

// Slot states
export type SlotState = 'DISPONIBLE' | 'RESERVADO' | 'CONFIRMADO' | 'CANCELADO' | 'BLOQUEADO';

// Cita states
export type CitaState = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_ASISTIO';

// Days of week
export type DayOfWeek = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

// Entity types
export type EntityType = 'HOSPITAL' | 'CLINICA' | 'IPS' | 'CONSULTORIO' | 'LABORATORIO';

// Document types
export type DocumentType = 'CC' | 'TI' | 'CE' | 'PA' | 'RC' | 'MS';

// Gender types
export type GenderType = 'MASCULINO' | 'FEMENINO' | 'OTRO';

// Civil status types
export type CivilStatusType = 'SOLTERO' | 'CASADO' | 'UNION_LIBRE' | 'DIVORCIADO' | 'VIUDO';

// Config validation
export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  databaseUrl: string;
  redisHost: string;
  redisPort: number;
  redisPassword: string;
  n8nWebhookSecret: string;
  corsOrigin: string;
}

// Utility type for making certain properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
