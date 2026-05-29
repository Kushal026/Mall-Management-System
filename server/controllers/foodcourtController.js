import pool from '../config/db.js';
import { validationError } from '../middleware/errorHandler.js';

export async function listFoodCourt(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM foodcourt ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

export async function createFoodItem(req, res, next) {
  try {
    const { name, category, price, availability, prep_time } = req.body;

    if (!name || !price) {
      throw validationError('name and price are required');
    }

    const availabilityFlag = availability === false ? false : true;

    const [result] = await pool.query(
      'INSERT INTO foodcourt (name, category, price, availability, prep_time) VALUES (?, ?, ?, ?, ?)',
      [name, category || 'Fast Food', Number(price), availabilityFlag, Number(prep_time || 0)],
    );

    const [rows] = await pool.query('SELECT * FROM foodcourt WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function updateFoodItem(req, res, next) {
  try {
    const { id } = req.params;
    const { name, category, price, availability, prep_time } = req.body;

    if (!name || !price) {
      throw validationError('name and price are required');
    }

    const availabilityFlag = availability === false ? false : true;

    await pool.query(
      'UPDATE foodcourt SET name = ?, category = ?, price = ?, availability = ?, prep_time = ? WHERE id = ?',
      [name, category || 'Fast Food', Number(price), availabilityFlag, Number(prep_time || 0), id],
    );

    const [rows] = await pool.query('SELECT * FROM foodcourt WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

export async function deleteFoodItem(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM foodcourt WHERE id = ?', [id]);
    res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function listOrders(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const { customer_name, food_item_id, quantity, status } = req.body;

    if (!customer_name || !food_item_id || !quantity) {
      throw validationError('customer_name, food_item_id, and quantity are required');
    }

    const [result] = await pool.query(
      'INSERT INTO orders (customer_name, food_item_id, quantity, status) VALUES (?, ?, ?, ?)',
      [customer_name, food_item_id, Number(quantity), status || 'pending'],
    );

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}
