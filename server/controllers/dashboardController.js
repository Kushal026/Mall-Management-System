import pool from '../config/db.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM shops) AS shops,
        (SELECT COUNT(*) FROM employees WHERE is_active = 1) AS employees,
        (SELECT COALESCE(SUM(total), 0) FROM bills) AS all_time_revenue,
        (SELECT COALESCE(SUM(total), 0) FROM bills WHERE DATE(created_at) = CURDATE()) AS today_revenue,
        (SELECT COUNT(*) FROM parking WHERE exit_time IS NULL) AS parking_occupied,
        (SELECT COUNT(*) FROM complaints WHERE status = 'open') AS open_complaints,
        (SELECT COUNT(*) FROM products WHERE quantity <= low_stock_threshold) AS low_stock,
        (SELECT COUNT(*) FROM bills WHERE DATE(created_at) = CURDATE()) AS invoices_today
    `);

    const [trendRows] = await pool.query(`
      SELECT DATE(created_at) AS day, COALESCE(SUM(total), 0) AS total
      FROM bills
      GROUP BY DATE(created_at)
      ORDER BY day DESC
      LIMIT 7
    `);

    // Compute totals needed for Net P&L so dashboard and billing match
    const [totalsRows] = await pool.query(`
      SELECT
        (SELECT COALESCE(SUM(rent_amount), 0) FROM shops) AS rent_total,
        (SELECT COALESCE(SUM(salary), 0) FROM employees WHERE is_active = 1) AS salary_total,
        (SELECT COUNT(*) FROM employees WHERE is_active = 1) AS active_employee_count,
        (SELECT COALESCE(SUM(fee), 0) FROM parking WHERE exit_time IS NOT NULL) AS parking_revenue
    `);

    const totals = totalsRows[0] || { rent_total: 0, salary_total: 0, active_employee_count: 0, parking_revenue: 0 };
    const rentTotal = Number(totals.rent_total || 0);
    const salaryTotal = Number(totals.salary_total || 0);
    const activeEmployeeCount = Number(totals.active_employee_count || 0);
    const parkingRevenue = Number(totals.parking_revenue || 0);

    const electricityBill = Math.round(rentTotal * 0.028 + activeEmployeeCount * 240);
    const waterBill = Math.round(rentTotal * 0.01 + activeEmployeeCount * 70);

    const net_pl = rentTotal + parkingRevenue - (salaryTotal + electricityBill + waterBill);

    res.json({
      success: true,
      data: {
        ...rows[0],
        revenue_trend: trendRows.reverse(),
        net_pl,
      },
    });
  } catch (error) {
    next(error);
  }
}
