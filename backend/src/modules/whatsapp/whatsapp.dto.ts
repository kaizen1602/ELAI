import { z } from 'zod';

// Send message to WhatsApp (N8N - secret validated by middleware)
export const sendMessageSchema = z.object({
  to: z.string().regex(/^\d{10,15}$/, 'to must be a valid phone number (10-15 digits)'),
  message: z.string().min(1, 'message is required').max(4096, 'message cannot exceed 4096 characters'),
});

export type SendMessageDTO = z.infer<typeof sendMessageSchema>;

// Send typing indicator (N8N - secret validated by middleware)
export const sendTypingSchema = z.object({
  to: z.string().regex(/^\d{10,15}$/, 'to must be a valid phone number'),
});

export type SendTypingDTO = z.infer<typeof sendTypingSchema>;

// Webhook verification query params
export const webhookVerifySchema = z.object({
  'hub.mode': z.string(),
  'hub.verify_token': z.string(),
  'hub.challenge': z.string(),
});

export type WebhookVerifyDTO = z.infer<typeof webhookVerifySchema>;

// Create or update conversation (N8N - secret validated by middleware)
export const createConversationSchema = z.object({
  sessionId: z.string().optional(),
  session_id: z.string().optional(),
  entidadMedicaId: z.string().optional(),
  entidad_medica: z.string().optional(), // Workflow sends this
  entidad_medica_id: z.string().optional(),
  pacienteId: z.string().optional(),
  paciente: z.string().optional(), // Workflow sends this (it's the ID)
  context: z.record(z.any()).optional(),
}).transform((data) => ({
  sessionId: data.sessionId || data.session_id,
  entidadMedicaId: data.entidadMedicaId || data.entidad_medica || data.entidad_medica_id,
  pacienteId: data.pacienteId || data.paciente,
  context: data.context
})).superRefine((data, ctx) => {
  if (!data.sessionId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "sessionId is required",
      path: ["sessionId"]
    });
  }
  if (!data.entidadMedicaId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "entidadMedicaId is required",
      path: ["entidadMedicaId"]
    });
  }
});

export type CreateConversationDTO = z.infer<typeof createConversationSchema>;

// Update conversation context (N8N - secret validated by middleware)
export const updateContextSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  context: z.record(z.any()),
});

export type UpdateContextDTO = z.infer<typeof updateContextSchema>;

// Query conversations (authenticated)
export const queryConversationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  entidadMedicaId: z.string().cuid('entidadMedicaId is required'),
  pacienteId: z.string().cuid().optional(),
  estado: z.enum(['ACTIVA', 'FINALIZADA', 'SUSPENDIDA']).optional(),
});

export type QueryConversationsDTO = z.infer<typeof queryConversationsSchema>;

// Validate patient (N8N - secret validated by middleware)
// Validate patient (N8N - secret validated by middleware)
export const validatePatientSchema = z.object({
  telefono: z.string().optional(),
  entidadMedicaId: z.string().optional(),
  documento: z.string().optional(),
});

export type ValidatePatientDTO = z.infer<typeof validatePatientSchema>;
