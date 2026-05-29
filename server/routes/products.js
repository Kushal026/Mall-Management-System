import express from 'express';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/productsController.js';

const router = express.Router();

router.get('/', listProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export const productsRoutes = router;
