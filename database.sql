-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  color VARCHAR(100),
  description TEXT,
  stock INT DEFAULT 0,
  is_hot_selling BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_top_viewed BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount DECIMAL(10, 2),
  min_purchase DECIMAL(10, 2),
  usage_limit INT,
  usage_count INT DEFAULT 0,
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  total_spent DECIMAL(10, 2) DEFAULT 0,
  orders_count INT DEFAULT 0,
  last_order_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role ENUM('admin', 'manager') DEFAULT 'admin',
  status ENUM('active', 'inactive') DEFAULT 'active',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample products (Sunglasses)
INSERT INTO products (id, name, category, price, color, description, stock) VALUES
(1, 'Classic Aviator Sunglasses', 'Sunglasses', 129.99, 'GOLD', 'Timeless aviator style with UV400', 25),
(2, 'Retro Round Sunglasses', 'Sunglasses', 99.99, 'BLACK', 'Vintage style lightweight frame', 30),
(3, 'Sport Performance Sunglasses', 'Sunglasses', 159.99, 'BLACK', 'Lightweight design for active lifestyles', 20),
(4, 'Luxury Designer Sunglasses', 'Sunglasses', 299.99, 'GOLD', 'Premium quality with designer aesthetics', 15);

-- Insert sample products (Clothes)
INSERT INTO products (id, name, category, price, color, description, stock) VALUES
(101, 'Premium Cotton T-Shirt', 'Clothes', 49.99, 'WHITE', 'High-quality 100% cotton t-shirt, comfortable and durable', 50),
(102, 'Designer Denim Jacket', 'Clothes', 189.99, 'BLUE', 'Classic denim jacket with modern design and superior quality', 18),
(103, 'Black Angora Wool Sweatshirt', 'Clothes', 2500.00, 'BLACK', 'Premium wool sweatshirt, perfect for winter wear', 40),
(104, 'Slim Fit Chinos', 'Clothes', 89.99, 'KHAKI', 'Versatile slim fit chinos, ideal for casual or formal wear', 28);

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, is_main) VALUES
(1, '/products/sunglasses/1.jpg', TRUE),
(1, '/products/sunglasses/2.jpg', FALSE),
(1, '/products/sunglasses/3.jpg', FALSE),
(2, '/products/sunglasses/4.jpg', TRUE),
(101, '/products/clothes/1.jpg', TRUE),
(102, '/products/clothes/2.jpg', TRUE),
(103, '/products/clothes/3.jpg', TRUE),
(104, '/products/clothes/4.jpg', TRUE);

-- Insert sample admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password, email, role) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'admin@alhurwear.com', 'admin');
