import pool from '../config/db.js';
import { validationError } from '../middleware/errorHandler.js';

function getPagination(req) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(5, Number(req.query.limit || 10)));
  return { page, limit, offset: (page - 1) * limit };
}

export async function listComplaints(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req);
    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || '').trim();

    const where = [];
    const params = [];

    if (search) {
      where.push('(complaint_number LIKE ? OR customer_name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT * FROM complaints ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM complaints ${whereClause}`, params);

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

export async function createComplaint(req, res, next) {
  try {
    const { customer_name, shop_id, category, description, priority, status } = req.body;

    if (!customer_name || !description) {
      throw validationError('customer_name and description are required');
    }

    const complaintNumber = `CMP-${Date.now().toString().slice(-6)}`;
    const [result] = await pool.query(
      'INSERT INTO complaints (complaint_number, customer_name, shop_id, category, description, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [complaintNumber, customer_name, shop_id || null, category || 'General', description, priority || 'medium', status || 'open'],
    );

    const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const { customer_name, shop_id, category, description, priority, status } = req.body;

    if (!customer_name || !description) {
      throw validationError('customer_name and description are required');
    }

    await pool.query(
      'UPDATE complaints SET customer_name = ?, shop_id = ?, category = ?, description = ?, priority = ?, status = ? WHERE id = ?',
      [customer_name, shop_id || null, category || 'General', description, priority || 'medium', status || 'open', id],
    );

    const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteComplaint(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM complaints WHERE id = ?', [id]);
    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    next(error);
  }
}
