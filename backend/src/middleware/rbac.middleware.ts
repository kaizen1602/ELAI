import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from './error.middleware';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if the authenticated user has one of the required roles
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!allowedRoles.includes(user.rol)) {
      throw new AppError(
        `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};

/**
 * Check if user is SuperAdmin
 */
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || user.rol !== UserRole.SUPERADMIN) {
    throw new AppError('Access denied. SuperAdmin role required', 403);
  }

  next();
};

/**
 * Check if user is Admin Entidad
 */
export const isAdminEntidad = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || (user.rol !== UserRole.ADMIN_ENTIDAD && user.rol !== UserRole.SUPERADMIN)) {
    throw new AppError('Access denied. Admin Entidad role required', 403);
  }

  next();
};

/**
 * Check if user is Medico
 */
export const isMedico = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || user.rol !== UserRole.MEDICO) {
    throw new AppError('Access denied. Medico role required', 403);
  }

  next();
};

/**
 * Check if user is Paciente
 */
export const isPaciente = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || user.rol !== UserRole.PACIENTE) {
    throw new AppError('Access denied. Paciente role required', 403);
  }

  next();
};
