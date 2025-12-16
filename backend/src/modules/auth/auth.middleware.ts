import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AppError } from '../../middleware/error.middleware';

/**
 * Authenticate user with JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from database
    const user = await authService.getUserById(decoded.id);

    if (!user || !user.activo) {
      throw new AppError('User not found or inactive', 401);
    }

    // Attach user to request
    (req as any).user = user;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = authService.verifyToken(token);
      const user = await authService.getUserById(decoded.id);

      if (user && user.activo) {
        (req as any).user = user;
      }
    }

    next();
  } catch (error) {
    // Don't throw error, just continue without user
    next();
  }
};
