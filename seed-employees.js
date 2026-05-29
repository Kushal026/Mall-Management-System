import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.SUPABASE_DATABASE_URL;

const employeesSQL = `
INSERT INTO public.employees (full_name, email, phone, department, shift, salary, password_hash, role, is_active)
VALUES
  ('Rajesh Kumar', 'rajesh@mall.com', '9876543210', 'Security', 'morning', 25000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Priya Singh', 'priya.singh@mall.com', '9876543211', 'Billing', 'afternoon', 28000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Amit Patel', 'amit@mall.com', '9876543212', 'Maintenance', 'night', 26000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Neha Sharma', 'neha@mall.com', '9876543213', 'Cleaning', 'morning', 22000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Vikas Gupta', 'vikas@mall.com', '9876543214', 'Security', 'afternoon', 25000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Anjali Verma', 'anjali@mall.com', '9876543215', 'Administration', 'morning', 32000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'admin', true),
  ('Suresh Reddy', 'suresh@mall.com', '9876543216', 'Maintenance', 'morning', 24000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Divya Nair', 'divya@mail.com', '9876543217', 'Billing', 'morning', 29000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true)
ON CONFLICT (email) DO NOTHING;
`;

async function seedDatabase() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase...\n');
    const client = await pool.connect();
    
    console.log('💾 Inserting employees...\n');
    const result = await client.query(employeesSQL);
    
    console.log(`✅ SUCCESS! Inserted ${result.rowCount} employees\n`);
    console.log('📋 Employees added:');
    console.log('  ✓ Rajesh Kumar (Security)');
    console.log('  ✓ Priya Singh (Billing)');
    console.log('  ✓ Amit Patel (Maintenance)');
    console.log('  ✓ Neha Sharma (Cleaning)');
    console.log('  ✓ Vikas Gupta (Security)');
    console.log('  ✓ Anjali Verma (Administration - Admin)');
    console.log('  ✓ Suresh Reddy (Maintenance)');
    console.log('  ✓ Divya Nair (Billing)\n');
    
    console.log('🎉 Now refresh your website to see all employees!');
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();
