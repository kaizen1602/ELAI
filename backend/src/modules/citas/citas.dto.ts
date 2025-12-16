import { z } from 'zod';

const EstadoCitaEnum = z.enum(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO_ASISTIO']);

export const createCitaSchema = z.object({
  slotId: z.string().cuid('slotId must be a valid CUID'),
  pacienteId: z.string().cuid('pacienteId must be a valid CUID'),
  motivoConsulta: z.string().max(500).optional(),
  sintomas: z.string().max(1000).optional(),
  notas: z.string().max(1000).optional(),
});

export type CreateCitaDTO = z.infer<typeof createCitaSchema>;

// Create cita from N8N (secret validated by middleware)
export const createCitaN8NSchema = createCitaSchema;

export type CreateCitaN8NDTO = z.infer<typeof createCitaN8NSchema>;

export const updateCitaSchema = z.object({
  estado: EstadoCitaEnum.optional(),
  motivoConsulta: z.string().max(500).optional(),
  sintomas: z.string().max(1000).optional(),
  notas: z.string().max(1000).optional(),
  recordatorioEnviado: z.boolean().optional(),
});

export type UpdateCitaDTO = z.infer<typeof updateCitaSchema>;

export const queryCitasSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  pacienteId: z.string().cuid().optional(),
  medicoId: z.string().cuid().optional(),
  entidadMedicaId: z.string().cuid().optional(),
  estado: EstadoCitaEnum.optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
});

export type QueryCitasDTO = z.infer<typeof queryCitasSchema>;

// Cancel cita
export const cancelCitaSchema = z.object({
  motivo: z.string().max(500).optional(),
});

export type CancelCitaDTO = z.infer<typeof cancelCitaSchema>;

// Send reminder (secret validated by middleware)
export const sendReminderSchema = z.object({
  citaId: z.string().cuid('citaId must be a valid CUID'),
});

export type SendReminderDTO = z.infer<typeof sendReminderSchema>;
