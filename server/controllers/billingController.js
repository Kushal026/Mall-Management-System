import pool from '../config/db.js';
import { validationError } from '../middleware/errorHandler.js';

function formatInvoiceNumber(dateStr) {
  const today = dateStr || new Date().toISOString().slice(0, 10);
  return `INV-${today.replace(/-/g, '')}-001`;
}

async function createInvoiceNumber(connection) {
  const [rows] = await connection.query(
    "SELECT COUNT(*) AS total FROM bills WHERE DATE(created_at) = CURDATE()",
  );
  const today = new Date().toISOString().slice(0, 10);
  const serial = Number(rows[0].total) + 1;
  return `INV-${today.replace(/-/g, '')}-${String(serial).padStart(4, '0')}`;
}

async function formatSalesRows(rows) {
  const itemsByBill = new Map();

  for (const bill of rows) {
    itemsByBill.set(bill.id, []);
  }

  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => '?').join(', ');
  const [items] = await pool.query(
    `SELECT * FROM bill_items WHERE bill_id IN (${placeholders}) ORDER BY id ASC`,
    ids,
  );

  for (const item of items) {
    const current = itemsByBill.get(item.bill_id) || [];
    current.push(item);
    itemsByBill.set(item.bill_id, current);
  }

  return rows.map((bill) => ({
    ...bill,
    items: itemsByBill.get(bill.id) || [],
  }));
}

export async function createBill(req, res, next) {
  try {
    const { customer_name, customer_contact, shop_id, payment_method, items, subtotal, gst, total } = req.body;

    if (!customer_name || !Array.isArray(items) || items.length === 0) {
      throw validationError('customer_name and at least one line item are required');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const invoiceNumber = await createInvoiceNumber(connection);
      const [billResult] = await connection.query(
        'INSERT INTO bills (invoice_number, customer_name, customer_contact, shop_id, payment_method, subtotal, gst, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [invoiceNumber, customer_name, customer_contact || null, shop_id || null, payment_method || 'cash', Number(subtotal || 0), Number(gst || 0), Number(total || 0)],
      );

      for (const item of items) {
        await connection.query(
          'INSERT INTO bill_items (bill_id, product_name, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?)',
          [billResult.insertId, item.name, Number(item.qty || 0), Number(item.price || 0), Number(item.qty || 0) * Number(item.price || 0)],
        );
      }

      await connection.commit();

      const [rows] = await connection.query('SELECT * FROM bills WHERE id = ?', [billResult.insertId]);
      const salesRows = await formatSalesRows(rows);

      res.status(201).json({ success: true, data: salesRows[0] });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

export async function listSales(req, res, next) {
  try {
    const limit = Math.min(100, Math.max(5, Number(req.query.limit || 50)));
    const [rows] = await pool.query('SELECT * FROM bills ORDER BY created_at DESC LIMIT ?', [limit]);
    const formatted = await formatSalesRows(rows);

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
}
