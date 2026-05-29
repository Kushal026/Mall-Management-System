CREATE DATABASE IF NOT EXISTS smartmall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartmall;

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(30) DEFAULT NULL,
  department VARCHAR(80) DEFAULT 'Administration',
  shift VARCHAR(40) DEFAULT 'morning',
  salary DECIMAL(12, 2) DEFAULT 0.00,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_name VARCHAR(160) NOT NULL,
  owner_name VARCHAR(120) DEFAULT NULL,
  contact VARCHAR(80) DEFAULT NULL,
  category VARCHAR(80) DEFAULT 'Retail',
  floor_number VARCHAR(40) DEFAULT NULL,
  rent_amount DECIMAL(12, 2) DEFAULT 0.00,
  status VARCHAR(40) DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(160) NOT NULL,
  category VARCHAR(80) DEFAULT 'General',
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  low_stock_threshold INT NOT NULL DEFAULT 10,
  supplier_id INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(80) NOT NULL UNIQUE,
  customer_name VARCHAR(160) NOT NULL,
  customer_contact VARCHAR(80) DEFAULT NULL,
  shop_id INT DEFAULT NULL,
  payment_method VARCHAR(40) DEFAULT 'cash',
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  gst DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bills_created_at (created_at),
  CONSTRAINT fk_bills_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bill_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL,
  product_name VARCHAR(160) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bill_items_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS parking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_number VARCHAR(40) NOT NULL,
  vehicle_type VARCHAR(20) NOT NULL,
  slot_number VARCHAR(20) DEFAULT NULL,
  entry_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exit_time TIMESTAMP NULL DEFAULT NULL,
  fee DECIMAL(12, 2) DEFAULT 0.00,
  ticket_code VARCHAR(40) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parking_active (exit_time, vehicle_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_number VARCHAR(80) NOT NULL UNIQUE,
  customer_name VARCHAR(160) NOT NULL,
  shop_id INT DEFAULT NULL,
  category VARCHAR(80) DEFAULT 'General',
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_complaints_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS foodcourt (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) DEFAULT 'Food',
  price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  availability TINYINT(1) NOT NULL DEFAULT 1,
  prep_time INT NOT NULL DEFAULT 15,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO employees (full_name, email, phone, department, shift, salary, password_hash, role, is_active)
VALUES
  ('Admin User', 'admin@smartmall.local', '9999999999', 'Administration', 'morning', 120000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'admin', 1),
  ('Priya Sharma', 'priya@smartmall.local', '8888888888', 'Security', 'night', 45000.00, '$2b$10$5pjDZrDv9kLr8w5Oh4Y5BOSERKJ1y3WKfJ2uN8qgS7ltq4q0Y1m8K', 'employee', 1);

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
