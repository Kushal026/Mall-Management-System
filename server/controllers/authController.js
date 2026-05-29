import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { signToken } from '../middleware/auth.js';
import { validationError } from '../middleware/errorHandler.js';

function sanitizeUser(row) {
  return {
    id: row.id,
    name: row.full_name || row.name || row.email,
    email: row.email,
    role: row.role || 'employee',
    type: row.type || (row.role === 'admin' ? 'admin' : 'employee'),
  };
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      throw validationError('fullName, email, and password are required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [existing] = await pool.query('SELECT id FROM admins WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (existing.length > 0) {
      throw validationError('An admin already exists with this email');
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [fullName.trim(), normalizedEmail, hash, 'admin'],
    );

    const user = sanitizeUser({ id: result.insertId, full_name: fullName.trim(), email: normalizedEmail, role: 'admin', type: 'admin' });
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw validationError('email and password are required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [adminRows] = await pool.query(
      'SELECT id, full_name AS full_name, email, password_hash, role FROM admins WHERE email = ? LIMIT 1',
      [normalizedEmail],
    );
    const [employeeRows] = await pool.query(
      'SELECT id, full_name, email, password_hash, role FROM employees WHERE email = ? AND is_active = true LIMIT 1',
      [normalizedEmail],
    );

    const admin = adminRows[0];
    const employee = employeeRows[0];

    const candidate = admin || employee;

    if (!candidate) {
      throw validationError('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, candidate.password_hash);

    if (!valid) {
      throw validationError('Invalid email or password');
    }

    const user = sanitizeUser({
      id: candidate.id,
      full_name: candidate.full_name,
      email: candidate.email,
      role: candidate.role || (admin ? 'admin' : 'employee'),
      type: admin ? 'admin' : 'employee',
    });

    const token = signToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
        type: req.user.type,
      },
    },
  });
}
