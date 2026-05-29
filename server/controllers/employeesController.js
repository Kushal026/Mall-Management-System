import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { validationError } from '../middleware/errorHandler.js';

function getPagination(req) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(5, Number(req.query.limit || 10)));
  return { page, limit, offset: (page - 1) * limit };
}

export async function listEmployees(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req);
    const search = String(req.query.search || '').trim();
    const department = String(req.query.department || '').trim();
    const sortBy = ['full_name', 'department', 'salary', 'created_at'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'created_at';
    const sortDirection = req.query.sortDirection === 'asc' ? 'ASC' : 'DESC';

    const where = [];
    const params = [];

    if (search) {
      where.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      where.push('department = ?');
      params.push(department);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT id, full_name, email, phone, department, shift, salary, is_active, role, created_at FROM employees ${whereClause} ORDER BY ${sortBy} ${sortDirection} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM employees ${whereClause}`, params);

    res.json({
      success: true,
      data: {
        items: rows,
        pagination: {
          page,
          limit,
          total: Number(countRows[0].total),
          pages: Math.ceil(Number(countRows[0].total) / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const { full_name, email, phone, department, shift, salary, password, role, is_active } = req.body;

    if (!full_name || !email || !password) {
      throw validationError('full_name, email, and password are required');
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO employees (full_name, email, phone, department, shift, salary, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [full_name, email.toLowerCase(), phone || null, department || 'Security', shift || 'morning', Number(salary || 0), hash, role || 'employee', is_active === false ? 0 : 1],
    );

    const [rows] = await pool.query('SELECT id, full_name, email, phone, department, shift, salary, is_active, role, created_at FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const { full_name, email, phone, department, shift, salary, role, is_active, password } = req.body;

    if (!full_name || !email) throw validationError('full_name and email are required');

    const fields = ['full_name = ?', 'email = ?', 'phone = ?', 'department = ?', 'shift = ?', 'salary = ?', 'role = ?', 'is_active = ?'];
    const values = [full_name, email.toLowerCase(), phone || null, department || 'Security', shift || 'morning', Number(salary || 0), role || 'employee', is_active === false ? 0 : 1, id];

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.splice(6, 0, 'password_hash = ?');
      values.splice(6, 0, hash);
    }

    await pool.query(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT id, full_name, email, phone, department, shift, salary, is_active, role, created_at FROM employees WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM employees WHERE id = ?', [id]);
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
}
