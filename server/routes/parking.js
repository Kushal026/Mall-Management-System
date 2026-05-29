import express from 'express';
import { checkIn, checkOut, listParking } from '../controllers/parkingController.js';

const router = express.Router();

router.get('/', listParking);
router.post('/entry', checkIn);
router.post('/exit/:id', checkOut);

export const parkingRoutes = router;
