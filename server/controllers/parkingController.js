import pool from '../config/db.js';
import { validationError } from '../middleware/errorHandler.js';

const TOTAL_SLOTS = {
  car: 850,
  bike: 150,
};

const RATES = {
  car: 40,
  bike: 20,
};

function prefixByType(type) {
  if (type === 'bike') return 'B';
  return 'C';
}

function calculateFee(entryTime, exitTime, type) {
  const minutes = Math.max(0, (new Date(exitTime).getTime() - new Date(entryTime).getTime()) / 60000);
  if (minutes <= 15) return 0;
  const hours = Math.ceil(minutes / 60);
  return hours * RATES[type];
}

async function allocateSlot(connection, vehicleType) {
  const used = new Set();
  const [rows] = await connection.query(
    'SELECT slot_number FROM parking WHERE exit_time IS NULL AND vehicle_type = ? ORDER BY slot_number ASC',
    [vehicleType],
  );

  rows.forEach((row) => used.add(row.slot_number));

  for (let i = 1; i <= TOTAL_SLOTS[vehicleType]; i += 1) {
    const slot = `${prefixByType(vehicleType)}-${String(i).padStart(3, '0')}`;
    if (!used.has(slot)) {
      return slot;
    }
  }

  return null;
}

export async function checkIn(req, res, next) {
  try {
    const { vehicle_number, vehicle_type } = req.body;

    if (!vehicle_number || !vehicle_type) {
      throw validationError('vehicle_number and vehicle_type are required');
    }

    const connection = await pool.getConnection();

    try {
      const [existing] = await connection.query('SELECT id FROM parking WHERE vehicle_number = ? AND exit_time IS NULL LIMIT 1', [vehicle_number.toUpperCase()]);
      if (existing.length > 0) {
        throw validationError('Vehicle is already parked');
      }

      const slot = await allocateSlot(connection, vehicle_type);
      if (!slot) {
        throw validationError(`No ${vehicle_type} slots available`);
      }

      const ticketCode = `${vehicle_number.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const [result] = await connection.query(
        'INSERT INTO parking (vehicle_number, vehicle_type, slot_number, entry_time, ticket_code) VALUES (?, ?, ?, NOW(), ?)',
        [vehicle_number.toUpperCase(), vehicle_type, slot, ticketCode],
      );

      const [rows] = await connection.query('SELECT * FROM parking WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: rows[0] });
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

export async function checkOut(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM parking WHERE id = ? AND exit_time IS NULL LIMIT 1', [id]);

    if (rows.length === 0) {
      throw validationError('Active parking record not found');
    }

    const record = rows[0];
    const fee = calculateFee(record.entry_time, new Date().toISOString(), record.vehicle_type);

    await pool.query('UPDATE parking SET exit_time = NOW(), fee = ? WHERE id = ?', [fee, id]);

    const [updated] = await pool.query('SELECT * FROM parking WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    next(error);
  }
}

export async function listParking(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM parking ORDER BY entry_time DESC LIMIT 100');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}
