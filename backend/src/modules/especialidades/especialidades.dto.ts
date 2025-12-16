import { z } from 'zod';

export const createEspecialidadSchema = z.object({
  nombre: z.string().min(1),
  duracionCita: z.number().int().positive(),
  descripcion: z.string().optional(),
});

export type CreateEspecialidadDTO = z.infer<typeof createEspecialidadSchema>;

export const updateEspecialidadSchema = createEspecialidadSchema.partial().extend({
  activa: z.boolean().optional(),
});
export type UpdateEspecialidadDTO = z.infer<typeof updateEspecialidadSchema>;
