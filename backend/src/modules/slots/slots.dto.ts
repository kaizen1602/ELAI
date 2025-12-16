import { z } from 'zod';

const EstadoSlotEnum = z.enum(['DISPONIBLE', 'RESERVADO', 'CONFIRMADO', 'CANCELADO', 'BLOQUEADO']);

const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createSlotSchema = z.object({
  agendaId: z.string().cuid('agendaId must be a valid CUID'),
  fecha: z.coerce.date(),
  horaInicio: z.string().regex(horaRegex, 'horaInicio must be in HH:mm format'),
  horaFin: z.string().regex(horaRegex, 'horaFin must be in HH:mm format'),
  estado: EstadoSlotEnum.default('DISPONIBLE'),
  notas: z.string().max(500).optional(),
}).refine((data) => {
  const [startHour, startMin] = data.horaInicio.split(':').map(Number);
  const [endHour, endMin] = data.horaFin.split(':').map(Number);
  return endHour * 60 + endMin > startHour * 60 + startMin;
}, {
  message: 'horaFin must be after horaInicio',
  path: ['horaFin'],
});

export type CreateSlotDTO = z.infer<typeof createSlotSchema>;

export const updateSlotSchema = z.object({
  estado: EstadoSlotEnum.optional(),
  notas: z.string().max(500).optional(),
});

export type UpdateSlotDTO = z.infer<typeof updateSlotSchema>;

// Lock slot (for N8N - secret validated by middleware)
export const lockSlotSchema = z.object({
  slotId: z.string().cuid('slotId must be a valid CUID'),
  sessionId: z.string().min(1, 'sessionId is required'), // WhatsApp phone number
});

export type LockSlotDTO = z.infer<typeof lockSlotSchema>;

// Unlock slot (for N8N - secret validated by middleware)
export const unlockSlotSchema = z.object({
  slotId: z.string().cuid('slotId must be a valid CUID'),
});

export type UnlockSlotDTO = z.infer<typeof unlockSlotSchema>;

// Query available slots
export const queryAvailableSlotsSchema = z.object({
  agendaId: z.string().cuid('agendaId must be a valid CUID').optional(),
  entidadMedicaId: z.string().cuid().optional(),
  categoria: z.string().optional(),
  fecha: z.coerce.date().optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
});

export type QueryAvailableSlotsDTO = z.infer<typeof queryAvailableSlotsSchema>;

// Bulk create slots
export const bulkCreateSlotsSchema = z.object({
  slots: z.array(createSlotSchema).min(1, 'At least one slot is required'),
});

export type BulkCreateSlotsDTO = z.infer<typeof bulkCreateSlotsSchema>;
