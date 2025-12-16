import { z } from 'zod';

export const createEntidadSchema = z.object({
  nombre: z.string().min(1, 'Name is required'),
  tipoEntidad: z.enum(['HOSPITAL', 'CLINICA', 'IPS', 'CONSULTORIO', 'LABORATORIO']),
  nitRut: z.string().min(1, 'NIT/RUT is required'),
  direccion: z.string().min(1, 'Address is required'),
  ciudad: z.string().min(1, 'City is required'),
  departamentoEstado: z.string().min(1, 'State/Department is required'),
  codigoPostal: z.string().optional(),
  telefonoPrincipal: z.string().min(1, 'Main phone is required'),
  telefonoSecundario: z.string().optional(),
  email: z.string().email('Invalid email'),
  emailContacto: z.preprocess((val) => val === '' ? undefined : val, z.string().email('Invalid contact email').optional()),
  sitioWeb: z.preprocess((val) => val === '' ? undefined : val, z.string().url('Invalid website URL').optional()),
  permiteCitasOnline: z.boolean().default(true),
  requiereAutorizacionCitas: z.boolean().default(false),
});

export type CreateEntidadDTO = z.infer<typeof createEntidadSchema>;

export const updateEntidadSchema = createEntidadSchema.partial().extend({
  activa: z.boolean().optional(),
});

export type UpdateEntidadDTO = z.infer<typeof updateEntidadSchema>;

export const queryEntidadesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  tipoEntidad: z.enum(['HOSPITAL', 'CLINICA', 'IPS', 'CONSULTORIO', 'LABORATORIO']).optional(),
  activa: z.coerce.boolean().optional(),
});

export type QueryEntidadesDTO = z.infer<typeof queryEntidadesSchema>;
