import express from 'express';
import { createBill, listSales } from '../controllers/billingController.js';

const router = express.Router();

router.post('/', createBill);
router.get('/sales', listSales);

export const billingRoutes = router;
