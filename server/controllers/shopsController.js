import pool from '../config/db.js';
import { validationError } from '../middleware/errorHandler.js';

function getPagination(req) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(5, Number(req.query.limit || 10)));
  return { page, limit, offset: (page - 1) * limit };
}

export async function listShops(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req);
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const sortBy = ['shop_name', 'rent_amount', 'floor_number', 'created_at'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'created_at';
    const sortDirection = req.query.sortDirection === 'asc' ? 'ASC' : 'DESC';

    const where = [];
    const params = [];

    if (search) {
      where.push('(shop_name LIKE ? OR owner_name LIKE ? OR contact LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      where.push('category = ?');
      params.push(category);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT * FROM shops ${whereClause} ORDER BY ${sortBy} ${sortDirection} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM shops ${whereClause}`,
      params,
    );

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

export async function createShop(req, res, next) {
  try {
    const { shop_name, owner_name, contact, category, floor_number, rent_amount, status, store_size } = req.body;
    if (!shop_name) throw validationError('shop_name (Store Number) is required');

    const [result] = await pool.query(
      'INSERT INTO shops (shop_name, owner_name, contact, category, floor_number, rent_amount, status, store_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [shop_name, owner_name || null, contact || null, category || 'Retail', Number(floor_number || 1), Number(rent_amount || 0), status || 'active', Number(store_size || 0)],
    );

    const [rows] = await pool.query('SELECT * FROM shops WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateShop(req, res, next) {
  try {
    const { id } = req.params;
    const { shop_name, owner_name, contact, category, floor_number, rent_amount, status, store_size } = req.body;

    if (!shop_name) throw validationError('shop_name (Store Number) is required');

    await pool.query(
      'UPDATE shops SET shop_name = ?, owner_name = ?, contact = ?, category = ?, floor_number = ?, rent_amount = ?, status = ?, store_size = ? WHERE id = ?',
      [shop_name, owner_name || null, contact || null, category || 'Retail', Number(floor_number || 1), Number(rent_amount || 0), status || 'active', Number(store_size || 0), id],
    );

    const [rows] = await pool.query('SELECT * FROM shops WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteShop(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM shops WHERE id = ?', [id]);
    res.json({ success: true, message: 'Shop deleted successfully' });
  } catch (error) {
    next(error);
  }
}
