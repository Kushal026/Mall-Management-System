import express from 'express';
import { createComplaint, deleteComplaint, listComplaints, updateComplaint } from '../controllers/complaintsController.js';

const router = express.Router();

router.get('/', listComplaints);
router.post('/', createComplaint);
router.put('/:id', updateComplaint);
router.delete('/:id', deleteComplaint);

export const complaintsRoutes = router;
