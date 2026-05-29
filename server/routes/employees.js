import express from 'express';
import { createEmployee, deleteEmployee, listEmployees, updateEmployee } from '../controllers/employeesController.js';

const router = express.Router();

router.get('/', listEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export const employeesRoutes = router;
