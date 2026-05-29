import express from 'express';
import { authRoutes } from './auth.js';
import { shopsRoutes } from './shops.js';
import { employeesRoutes } from './employees.js';
import { productsRoutes } from './products.js';
import { billingRoutes } from './billing.js';
import { parkingRoutes } from './parking.js';
import { complaintsRoutes } from './complaints.js';
// import { foodCourtRoutes } from './foodcourt.js';
import { dashboardRoutes } from './dashboard.js';
import { publicRoutes } from './public.js';
import { devRoutes } from './dev.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use('/', authRoutes);
router.use('/shops', authenticate, shopsRoutes);
router.use('/employees', authenticate, employeesRoutes);
router.use('/products', authenticate, productsRoutes);
router.use('/billing', authenticate, billingRoutes);
router.use('/parking', authenticate, parkingRoutes);
router.use('/complaints', authenticate, complaintsRoutes);
// router.use('/foodcourt', authenticate, foodCourtRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
// Development: expose a public dashboard summary endpoint for quick verification
router.use('/public', publicRoutes);
// Development only: reset passwords and quick helpers
router.use('/dev', devRoutes);

export default router;
