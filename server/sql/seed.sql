USE smartmall;

INSERT INTO employees (full_name, email, phone, department, shift, salary, password_hash, role, is_active)
VALUES
  ('Admin User', 'admin@smartmall.local', '9999999999', 'Administration', 'morning', 120000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'admin', 1),
  ('Priya Sharma', 'priya@smartmall.local', '8888888888', 'Security', 'night', 45000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', 1),
  ('Rajesh Kumar', 'rajesh@mall.com', '9876543210', 'Security', 'morning', 25000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', 1),
  ('Priya Singh', 'priya.singh@mall.com', '9876543211', 'Billing', 'afternoon', 28000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', 1),
  ('Amit Patel', 'amit@mall.com', '9876543212', 'Maintenance', 'night', 26000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', 1),
  ('Neha Sharma', 'neha@mall.com', '9876543213', 'Cleaning', 'morning', 22000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', 1),
  ('Vikas Gupta', 'vikas@mall.com', '9876543214', 'Security', 'afternoon', 25000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', 1),
  ('Anjali Verma', 'anjali@mall.com', '9876543215', 'Administration', 'morning', 32000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'admin', 1),
  ('Suresh Reddy', 'suresh@mall.com', '9876543216', 'Maintenance', 'morning', 24000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', 1),
  ('Divya Nair', 'divya@mall.com', '9876543217', 'Billing', 'morning', 29000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', 1);

INSERT INTO shops (shop_name, owner_name, contact, category, floor_number, rent_amount, status)
VALUES
  ('Zara', 'Aarav Kapoor', '9988776655', 'Fashion', '2', 150000.00, 'active'),
  ('Spice Hub', 'Nina Menon', '8877665544', 'Food', '1', 120000.00, 'active');

INSERT INTO products (product_name, category, quantity, price, low_stock_threshold)
VALUES
  ('Coffee Beans', 'Beverage', 18, 320.00, 8),
  ('Cleaning Spray', 'Cleaning', 5, 180.00, 10),
  ('Disposable Gloves', 'Safety', 60, 70.00, 15);

INSERT INTO foodcourt (name, category, price, availability, prep_time)
VALUES
  ('Veggie Noodles', 'Main Course', 160.00, 1, 12),
  ('Mango Shake', 'Beverage', 90.00, 1, 8);

INSERT INTO complaints (complaint_number, customer_name, shop_id, category, description, priority, status)
VALUES
  ('COM-0001', 'Rohan Verma', 1, 'Service', 'Delay in billing response at checkout.', 'high', 'open');
