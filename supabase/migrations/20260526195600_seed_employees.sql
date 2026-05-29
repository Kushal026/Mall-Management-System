-- Seed employees table with initial data
INSERT INTO public.employees (full_name, email, phone, department, shift, salary, password_hash, role, is_active)
VALUES
  ('Admin User', 'admin@smartmall.local', '9999999999', 'Administration', 'morning', 120000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'admin', true),
  ('Priya Sharma', 'priya@smartmall.local', '8888888888', 'Security', 'night', 45000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Rajesh Kumar', 'rajesh@mall.com', '9876543210', 'Security', 'morning', 25000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Priya Singh', 'priya.singh@mall.com', '9876543211', 'Billing', 'afternoon', 28000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Amit Patel', 'amit@mall.com', '9876543212', 'Maintenance', 'night', 26000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Neha Sharma', 'neha@mall.com', '9876543213', 'Cleaning', 'morning', 22000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Vikas Gupta', 'vikas@mall.com', '9876543214', 'Security', 'afternoon', 25000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Anjali Verma', 'anjali@mall.com', '9876543215', 'Administration', 'morning', 32000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'admin', true),
  ('Suresh Reddy', 'suresh@mall.com', '9876543216', 'Maintenance', 'morning', 24000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true),
  ('Divya Nair', 'divya@mall.com', '9876543217', 'Billing', 'morning', 29000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', true)
ON CONFLICT (email) DO NOTHING;
