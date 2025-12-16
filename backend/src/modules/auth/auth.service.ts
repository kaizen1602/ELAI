import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { jwtConfig } from '../../config/jwt';
import { AppError } from '../../middleware/error.middleware';
import { LoginDTO, RegisterUserDTO, ChangePasswordDTO, UpdateProfileDTO } from './auth.dto';
import { UserRole } from '@prisma/client';

interface JWTPayload {
  id: string;
  username: string;
  email: string;
  rol: UserRole;
}

export class AuthService {
  /**
   * Login user and generate JWT token
   */
  async login(data: LoginDTO) {
    const { username, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        adminEntidad: {
          include: {
            entidadMedica: true,
          },
        },
        medico: {
          include: {
            entidadMedica: true,
            especialidad: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.activo) {
      throw new AppError('User account is inactive', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = this.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      rol: user.rol,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Register new user
   */
  async register(data: RegisterUserDTO) {
    const { username, email, password, rol, telefono } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new AppError('Username or email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        rol,
        telefono,
      },
      select: {
        id: true,
        username: true,
        email: true,
        rol: true,
        telefono: true,
        activo: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        rol: true,
        telefono: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
        adminEntidad: {
          include: {
            entidadMedica: true,
          },
        },
        medico: {
          include: {
            entidadMedica: true,
            especialidad: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        telefono: data.telefono,
      },
      select: {
        id: true,
        username: true,
        email: true,
        rol: true,
        telefono: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, data: ChangePasswordDTO) {
    const { currentPassword, newPassword } = data;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        rol: true,
        telefono: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Get users by role (optional) and filter available ones
   */
  async getUsers(role?: string) {
    const where: any = {};

    if (role) {
      where.rol = role as UserRole;

      // If looking for MEDICO, only return those who don't have a medico profile yet
      if (role === 'MEDICO') {
        where.medico = null;
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        rol: true,
        // password: false is default if not selected, but explicit exclusion is deprecated/not needed in select blocks usually, 
        // but if I select specific fields, others are excluded.
      },
    });

    return users;
  }
}

export const authService = new AuthService();
