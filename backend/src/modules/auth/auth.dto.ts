import { z } from 'zod';

// Login DTO
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginDTO = z.infer<typeof loginSchema>;

// Register User DTO
export const registerUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rol: z.enum(['SUPERADMIN', 'ADMIN_ENTIDAD', 'MEDICO', 'PACIENTE']),
  telefono: z.string().optional(),
});

export type RegisterUserDTO = z.infer<typeof registerUserSchema>;

// Change Password DTO
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

// Update Profile DTO
export const updateProfileSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  telefono: z.string().optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

// Refresh Token DTO
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
