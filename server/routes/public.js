import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';

const router = express.Router();

// Public debug endpoint (development only) — returns the dashboard summary without authentication
router.get('/dashboard-summary', getDashboardSummary);

export { router as publicRoutes };
