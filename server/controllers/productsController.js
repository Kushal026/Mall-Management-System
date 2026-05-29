import pool from '../config/db.js';
import { validationError } from '../middleware/errorHandler.js';

function getPagination(req) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(5, Number(req.query.limit || 10)));
  return { page, limit, offset: (page - 1) * limit };
}

export async function listProducts(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req);
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const lowStock = req.query.lowStock === 'true';
    const sortBy = ['product_name', 'quantity', 'price', 'updated_at'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'updated_at';
    const sortDirection = req.query.sortDirection === 'asc' ? 'ASC' : 'DESC';

    const where = [];
    const params = [];

    if (search) {
      where.push('(product_name LIKE ? OR category LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      where.push('category = ?');
      params.push(category);
    }

    if (lowStock) {
      where.push('quantity <= low_stock_threshold');
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT * FROM products ${whereClause} ORDER BY ${sortBy} ${sortDirection} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM products ${whereClause}`, params);

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

export async function createProduct(req, res, next) {
  try {
    const { product_name, category, quantity, price, low_stock_threshold, supplier_id } = req.body;

    if (!product_name) throw validationError('product_name is required');

    const [result] = await pool.query(
      'INSERT INTO products (product_name, category, quantity, price, low_stock_threshold, supplier_id) VALUES (?, ?, ?, ?, ?, ?)',
      [product_name, category || 'General', Number(quantity || 0), Number(price || 0), Number(low_stock_threshold || 10), supplier_id || null],
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { product_name, category, quantity, price, low_stock_threshold, supplier_id } = req.body;

    if (!product_name) throw validationError('product_name is required');

    await pool.query(
      'UPDATE products SET product_name = ?, category = ?, quantity = ?, price = ?, low_stock_threshold = ?, supplier_id = ? WHERE id = ?',
      [product_name, category || 'General', Number(quantity || 0), Number(price || 0), Number(low_stock_threshold || 10), supplier_id || null, id],
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
}
