import express from 'express';
import { createShop, deleteShop, listShops, updateShop } from '../controllers/shopsController.js';

const router = express.Router();

router.get('/', listShops);
router.post('/', createShop);
router.put('/:id', updateShop);
router.delete('/:id', deleteShop);

export const shopsRoutes = router;
