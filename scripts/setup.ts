import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

async function setupDatabase() {
  // First, connect without database to create it if it doesn't exist
  const rootPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    console.log('📋 Setting up database...\n');

    // Create database if it doesn't exist
    const rootConnection = await rootPool.getConnection();
    const dbName = process.env.DB_NAME || 'alhurwear';
    
    console.log(`1️⃣  Creating database "${dbName}" if it doesn't exist...`);
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database ready\n`);
    
    rootConnection.release();

    // Now connect to the actual database
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const connection = await pool.getConnection();

    // Read and execute database.sql
    console.log('2️⃣  Creating database tables...');
    const sqlPath = path.join(process.cwd(), 'database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log(`✓ Tables created\n`);

    // Check if products already exist
    const [existingProducts] = await connection.query('SELECT COUNT(*) as count FROM products');
    const productCount = ((existingProducts as Array<{count: number}>)[0]).count;

    if (productCount > 0) {
      console.log(`⚠️  Database already contains ${productCount} products. Skipping seeding to avoid duplicates.`);
      console.log('💡 If you want to reseed, run: npm run seed:reset\n');
      connection.release();
      await pool.end();
      await rootPool.end();
      return;
    }

    // Insert dummy data
    console.log('3️⃣  Seeding database with dummy data...\n');

    // Products
    const clothesProducts = [
      {
        name: 'Premium Cotton T-Shirt',
        category: 'clothes',
        price: 29.99,
        color: 'Black',
        description: 'High quality cotton t-shirt, perfect for everyday wear',
        stock: 50,
        is_hot_selling: true,
        is_new_arrival: false,
        is_top_viewed: true,
      },
      {
        name: 'Classic Denim Jeans',
        category: 'clothes',
        price: 79.99,
        color: 'Blue',
        description: 'Comfortable and stylish denim jeans for all occasions',
        stock: 35,
        is_hot_selling: true,
        is_new_arrival: true,
        is_top_viewed: true,
      },
      {
        name: 'Lightweight Hoodie',
        category: 'clothes',
        price: 49.99,
        color: 'Gray',
        description: 'Perfect hoodie for casual and comfortable style',
        stock: 40,
        is_hot_selling: false,
        is_new_arrival: true,
        is_top_viewed: false,
      },
      {
        name: 'Elegant Polo Shirt',
        category: 'clothes',
        price: 39.99,
        color: 'White',
        description: 'Professional polo shirt suitable for casual or semi-formal wear',
        stock: 45,
        is_hot_selling: false,
        is_new_arrival: false,
        is_top_viewed: true,
      },
      {
        name: 'Summer Linen Shirt',
        category: 'clothes',
        price: 44.99,
        color: 'Beige',
        description: 'Cool and breathable linen shirt perfect for hot weather',
        stock: 30,
        is_hot_selling: true,
        is_new_arrival: true,
        is_top_viewed: false,
      },
    ];

    const sunglassesProducts = [
      {
        name: 'Classic Aviator Sunglasses',
        category: 'sunglasses',
        price: 89.99,
        color: 'Silver',
        description: 'Timeless aviator style with UV protection',
        stock: 25,
        is_hot_selling: true,
        is_new_arrival: false,
        is_top_viewed: true,
      },
      {
        name: 'Polarized Wayfarer Shades',
        category: 'sunglasses',
        price: 99.99,
        color: 'Black',
        description: 'Premium polarized sunglasses with anti-glare technology',
        stock: 20,
        is_hot_selling: true,
        is_new_arrival: true,
        is_top_viewed: true,
      },
      {
        name: 'Sport Wrap Around Glasses',
        category: 'sunglasses',
        price: 74.99,
        color: 'Blue',
        description: 'Perfect for sports and outdoor activities',
        stock: 18,
        is_hot_selling: false,
        is_new_arrival: false,
        is_top_viewed: true,
      },
      {
        name: 'Oversized Cat Eye Sunglasses',
        category: 'sunglasses',
        price: 84.99,
        color: 'Brown',
        description: 'Fashionable oversized cat eye style for a trendy look',
        stock: 22,
        is_hot_selling: false,
        is_new_arrival: true,
        is_top_viewed: false,
      },
      {
        name: 'Round Retro Sunglasses',
        category: 'sunglasses',
        price: 69.99,
        color: 'Gold',
        description: 'Vintage round design with modern UV protection',
        stock: 28,
        is_hot_selling: true,
        is_new_arrival: false,
        is_top_viewed: false,
      },
    ];

    const allProducts = [...clothesProducts, ...sunglassesProducts];
    
    for (const product of allProducts) {
      await connection.query(
        `INSERT INTO products (name, category, price, color, description, stock, is_hot_selling, is_new_arrival, is_top_viewed) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.category,
          product.price,
          product.color,
          product.description,
          product.stock,
          product.is_hot_selling,
          product.is_new_arrival,
          product.is_top_viewed,
        ]
      );
      console.log(`   ✓ ${product.name}`);
    }

    // Admin user
    console.log('\n   Adding admin user...');
    await connection.query(
      `INSERT INTO admin_users (username, password, email, role, status) 
       VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin123', 'admin@alhurwear.com', 'admin', 'active']
    );
    console.log(`   ✓ admin (password: admin123)`);

    // Customers
    console.log('\n   Adding sample customers...');
    const customers = [
      ['John Doe', 'john@example.com', '+1-234-567-8900', '123 Main Street', 'New York', 'USA', 'active'],
      ['Jane Smith', 'jane@example.com', '+1-234-567-8901', '456 Oak Avenue', 'Los Angeles', 'USA', 'active'],
      ['Ahmed Hassan', 'ahmed@example.com', '+966-50-1234567', 'Riyadh Street', 'Riyadh', 'Saudi Arabia', 'active'],
    ];

    for (const customer of customers) {
      await connection.query(
        `INSERT INTO customers (name, email, phone, address, city, country, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        customer
      );
      console.log(`   ✓ ${customer[0]}`);
    }

    // Promo codes
    console.log('\n   Adding promo codes...');
    const promoCodes = [
      ['WELCOME10', 'percentage', 10, 50, 0, 100, 'active'],
      ['SUMMER20', 'percentage', 20, 100, 50, 50, 'active'],
      ['SAVE25', 'fixed', 25, null, 100, 30, 'active'],
    ];

    for (const promo of promoCodes) {
      await connection.query(
        `INSERT INTO promo_codes (code, discount_type, discount_value, max_discount, min_purchase, usage_limit, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        promo
      );
      console.log(`   ✓ ${promo[0]}`);
    }

    connection.release();
    await pool.end();
    await rootPool.end();

    console.log('\n✅ Database setup completed successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📝 Admin Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📦 Data Added:');
    console.log('   • 10 Products (5 clothes + 5 sunglasses)');
    console.log('   • 1 Admin user');
    console.log('   • 3 Sample customers');
    console.log('   • 3 Promo codes (WELCOME10, SUMMER20, SAVE25)');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('🚀 You can now:');
    console.log('   1. Run "npm run dev" to start the development server');
    console.log('   2. Login as admin at http://localhost:3000/admin/login');
    console.log('   3. Browse products at http://localhost:3000/ as a customer');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    await rootPool.end();
    process.exit(1);
  }
}

setupDatabase();
