import { Response } from 'express';
import { dashboardService } from './dashboard.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthenticatedRequest } from '../../types';

export class DashboardController {
  /**
   * @route GET /api/v1/dashboard/stats
   * @desc Get dashboard statistics
   * @access Private
   */
  getStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await dashboardService.getStats(req);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * @route GET /api/v1/dashboard/recent-appointments
   * @desc Get recent appointments
   * @access Private
   */
  getRecentAppointments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const appointments = await dashboardService.getRecentAppointments(req, limit);

    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length,
    });
  });

  /**
   * @route GET /api/v1/dashboard/appointments-by-date
   * @desc Get appointments grouped by date (for charts)
   * @access Private
   */
  getAppointmentsByDate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Last 30 days by default

    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const data = await dashboardService.getAppointmentsByDateRange(req, startDate, endDate);

    res.status(200).json({
      success: true,
      data,
    });
  });
}

export const dashboardController = new DashboardController();
