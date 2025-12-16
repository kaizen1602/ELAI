import { z } from 'zod';

const ModeloIAEnum = z.enum(['GPT_4O_MINI', 'GPT_4', 'GPT_3_5_TURBO']);
const TipoOperacionEnum = z.enum([
  'CLASIFICACION_INTENCION',
  'CLASIFICACION_SINTOMAS',
  'RESPUESTA_CALIDA',
  'AGENTE_CONVERSACIONAL',
]);

// Log AI usage (from N8N - secret validated by middleware)
export const logUsageSchema = z.object({
  entidadMedicaId: z.string().cuid('entidadMedicaId must be a valid CUID'),
  conversacionId: z.string().cuid().optional(),
  sessionId: z.string().min(1, 'sessionId is required'),
  modelo: ModeloIAEnum,
  tipoOperacion: TipoOperacionEnum,
  tokensPrompt: z.number().int().min(0, 'tokensPrompt cannot be negative'),
  tokensCompletion: z.number().int().min(0, 'tokensCompletion cannot be negative'),
  duracionMs: z.number().int().min(0).optional(),
  metadata: z.record(z.any()).optional(),
});

export type LogUsageDTO = z.infer<typeof logUsageSchema>;

// Query usage summary
export const queryUsageSummarySchema = z.object({
  entidadMedicaId: z.string().cuid('entidadMedicaId must be a valid CUID'),
  period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
});

export type QueryUsageSummaryDTO = z.infer<typeof queryUsageSummarySchema>;

// Check limits
export const checkLimitsSchema = z.object({
  entidadMedicaId: z.string().cuid('entidadMedicaId must be a valid CUID'),
});

export type CheckLimitsDTO = z.infer<typeof checkLimitsSchema>;

// Update consumption limits
export const updateLimitsSchema = z.object({
  entidadMedicaId: z.string().cuid('entidadMedicaId must be a valid CUID'),
  limiteTokensDiario: z.number().int().min(0).optional(),
  limiteTokensSemanal: z.number().int().min(0).optional(),
  limiteTokensMensual: z.number().int().min(0).optional(),
  alertaUmbralPorcent: z.number().int().min(0).max(100).optional(),
  alertasActivas: z.boolean().optional(),
});

export type UpdateLimitsDTO = z.infer<typeof updateLimitsSchema>;

// Check if within limits (for N8N - secret validated by middleware)
export const canUseAISchema = z.object({
  entidadMedicaId: z.string().cuid('entidadMedicaId must be a valid CUID'),
  estimatedTokens: z.number().int().min(0).default(500),
});

export type CanUseAIDTO = z.infer<typeof canUseAISchema>;

// Usage stats response
export interface UsageStats {
  periodo: string;
  tokensUsados: number;
  tokensLimite: number;
  porcentajeUso: number;
  costoEstimado: number;
}

export interface LimitsCheckResult {
  withinLimits: boolean;
  canProceed: boolean;
  currentUsage: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  percentages: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  alerts: Array<{
    period: string;
    message: string;
    percentage: number;
  }>;
}
