import { z } from 'zod';

export const createPacienteSchema = z.object({
  entidadMedicaId: z.string().cuid(),
  tipoDocumento: z.enum(['CC', 'TI', 'CE', 'PA', 'RC', 'MS']),
  numeroDocumento: z.string().min(1),
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  fechaNacimiento: z.coerce.date(),
  genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO']),
  estadoCivil: z.enum(['SOLTERO', 'CASADO', 'UNION_LIBRE', 'DIVORCIADO', 'VIUDO']).optional(),
  epsAseguradora: z.string().optional(),
  tipoSangre: z.string().optional(),
  alergias: z.string().optional(),
  telefono: z.string().min(1),
  telefonoSecundario: z.string().optional(),
  email: z.preprocess((val) => val === '' ? undefined : val, z.string().email().optional()),
  direccion: z.string().min(1),
  ciudad: z.string().min(1),
  departamento: z.string().min(1),
  codigoPostal: z.string().optional(),
  contactoEmergenciaNombre: z.string().optional(),
  contactoEmergenciaTelefono: z.string().optional(),
});

export type CreatePacienteDTO = z.infer<typeof createPacienteSchema>;

export const updatePacienteSchema = createPacienteSchema.partial().omit({ entidadMedicaId: true }).extend({
  activo: z.boolean().optional(),
});
export type UpdatePacienteDTO = z.infer<typeof updatePacienteSchema>;

export const queryPacientesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  entidadMedicaId: z.string().cuid().optional(),
  activo: z.coerce.boolean().optional(),
});

export type QueryPacientesDTO = z.infer<typeof queryPacientesSchema>;
