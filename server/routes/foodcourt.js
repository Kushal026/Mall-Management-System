import express from 'express';
import { createFoodItem, createOrder, deleteFoodItem, listFoodCourt, listOrders, updateFoodItem } from '../controllers/foodcourtController.js';

const router = express.Router();

router.get('/', listFoodCourt);
router.post('/', createFoodItem);
router.put('/:id', updateFoodItem);
router.delete('/:id', deleteFoodItem);
router.get('/orders', listOrders);
router.post('/orders', createOrder);

export const foodCourtRoutes = router;
