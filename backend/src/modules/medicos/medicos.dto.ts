import { z } from 'zod';

export const createMedicoSchema = z.object({
  userId: z.string().cuid(),
  entidadMedicaId: z.string().cuid(),
  especialidadId: z.string().cuid(),
  numeroLicencia: z.string().min(1),
});

export type CreateMedicoDTO = z.infer<typeof createMedicoSchema>;

export const updateMedicoSchema = createMedicoSchema.partial().omit({ userId: true }).extend({
  activo: z.boolean().optional(),
  // User fields that come from the frontend form
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
});
export type UpdateMedicoDTO = z.infer<typeof updateMedicoSchema>;
