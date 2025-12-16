import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  loginSchema,
  registerUserSchema,
  changePasswordSchema,
  updateProfileSchema,
} from './auth.dto';
import { asyncHandler } from '../../middleware/error.middleware';

export class AuthController {
  /**
   * @route POST /api/v1/auth/login
   * @desc Login user
   * @access Public
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const validated = loginSchema.parse(req.body);
    const result = await authService.login(validated);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * @route POST /api/v1/auth/register
   * @desc Register new user
   * @access Public (or admin only - depends on your requirements)
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const validated = registerUserSchema.parse(req.body);
    const user = await authService.register(validated);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully',
    });
  });

  /**
   * @route GET /api/v1/auth/profile
   * @desc Get current user profile
   * @access Private
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const profile = await authService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  });

  /**
   * @route PUT /api/v1/auth/profile
   * @desc Update user profile
   * @access Private
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const validated = updateProfileSchema.parse(req.body);
    const updatedUser = await authService.updateProfile(userId, validated);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  });

  /**
   * @route POST /api/v1/auth/change-password
   * @desc Change user password
   * @access Private
   */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const validated = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(userId, validated);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  /**
   * @route GET /api/v1/auth/me
   * @desc Get current authenticated user (lightweight)
   * @access Private
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * @route GET /api/v1/auth/users
   * @desc Get users (helper for dropdowns)
   * @access Private
   */
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const { rol } = req.query;
    const users = await authService.getUsers(rol as string);

    res.status(200).json({
      success: true,
      data: users,
    });
  });
}

export const authController = new AuthController();
