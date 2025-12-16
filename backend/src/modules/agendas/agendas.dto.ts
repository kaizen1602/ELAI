import { z } from 'zod';

const DiaSemanaEnum = z.enum(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']);

// Validación de formato de hora HH:mm
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const baseAgendaSchema = z.object({
  medicoId: z.string().cuid('medicoId must be a valid CUID'),
  entidadMedicaId: z.string().cuid('entidadMedicaId must be a valid CUID'),
  nombre: z.string().min(1, 'nombre is required').max(100),
  diaSemana: DiaSemanaEnum,
  horaInicio: z.string().regex(horaRegex, 'horaInicio must be in HH:mm format'),
  horaFin: z.string().regex(horaRegex, 'horaFin must be in HH:mm format'),
  duracionSlot: z.number().int().min(5, 'duracionSlot must be at least 5 minutes').max(480, 'duracionSlot cannot exceed 8 hours'),
});

export const createAgendaSchema = baseAgendaSchema.refine((data) => {
  // Validate horaFin > horaInicio
  const [startHour, startMin] = data.horaInicio.split(':').map(Number);
  const [endHour, endMin] = data.horaFin.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return endMinutes > startMinutes;
}, {
  message: 'horaFin must be after horaInicio',
  path: ['horaFin'],
});

export type CreateAgendaDTO = z.infer<typeof createAgendaSchema>;

export const updateAgendaSchema = baseAgendaSchema.partial().omit({
  medicoId: true,
  entidadMedicaId: true,
}).extend({
  activa: z.boolean().optional(),
});

export type UpdateAgendaDTO = z.infer<typeof updateAgendaSchema>;

export const queryAgendasSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  entidadMedicaId: z.string().cuid().optional(),
  medicoId: z.string().cuid().optional(),
  diaSemana: DiaSemanaEnum.optional(),
  activa: z.coerce.boolean().optional(),
});

export type QueryAgendasDTO = z.infer<typeof queryAgendasSchema>;

// Generate slots for a date range
export const generateSlotsSchema = z.object({
  agendaId: z.string().cuid('agendaId must be a valid CUID'),
  fechaInicio: z.coerce.date(),
  fechaFin: z.coerce.date(),
}).refine((data) => data.fechaFin >= data.fechaInicio, {
  message: 'fechaFin must be after or equal to fechaInicio',
  path: ['fechaFin'],
});

export type GenerateSlotsDTO = z.infer<typeof generateSlotsSchema>;
