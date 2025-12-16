import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/recent-appointments', dashboardController.getRecentAppointments);
router.get('/appointments-by-date', dashboardController.getAppointmentsByDate);

export default router;
