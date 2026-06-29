import express from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate); // Require authentication for all analytics endpoints

router.get('/', AnalyticsController.getSummary);
router.get('/summary', AnalyticsController.getSummary);

// UI compatibility routes
router.get('/kpis', AnalyticsController.getKPIs);
router.get('/focus', AnalyticsController.getFocusChart);
router.get('/velocity', AnalyticsController.getVelocityChart);
router.get('/weekly-comparison', AnalyticsController.getWeeklyComparison);
router.get('/goal-allocation', AnalyticsController.getGoalAllocation);

export default router;
