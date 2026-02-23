import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alhurwear',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log('🌱 Starting database seeding...');

    // Insert dummy products for clothes
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

    // Insert dummy products for sunglasses
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

    // Insert all products
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
      console.log(`✓ Added product: ${product.name}`);
    }

    // Insert dummy admin user
    const adminData = {
      username: 'admin',
      password: 'admin123', // You should hash this in production
      email: 'admin@alhurwear.com',
      role: 'admin',
      status: 'active',
    };

    await connection.query(
      `INSERT INTO admin_users (username, password, email, role, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [adminData.username, adminData.password, adminData.email, adminData.role, adminData.status]
    );
    console.log(`✓ Added admin user: ${adminData.username}`);

    // Insert dummy customers
    const customers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-234-567-8900',
        address: '123 Main Street',
        city: 'New York',
        country: 'USA',
        status: 'active',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1-234-567-8901',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        country: 'USA',
        status: 'active',
      },
      {
        name: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        phone: '+966-50-1234567',
        address: 'Riyadh Street',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        status: 'active',
      },
    ];

    for (const customer of customers) {
      await connection.query(
        `INSERT INTO customers (name, email, phone, address, city, country, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          customer.name,
          customer.email,
          customer.phone,
          customer.address,
          customer.city,
          customer.country,
          customer.status,
        ]
      );
      console.log(`✓ Added customer: ${customer.name}`);
    }

    // Insert dummy promo codes
    const promoCodes = [
      {
        code: 'WELCOME10',
        discount_type: 'percentage',
        discount_value: 10,
        max_discount: 50,
        min_purchase: 0,
        usage_limit: 100,
        status: 'active',
      },
      {
        code: 'SUMMER20',
        discount_type: 'percentage',
        discount_value: 20,
        max_discount: 100,
        min_purchase: 50,
        usage_limit: 50,
        status: 'active',
      },
      {
        code: 'SAVE25',
        discount_type: 'fixed',
        discount_value: 25,
        max_discount: null,
        min_purchase: 100,
        usage_limit: 30,
        status: 'active',
      },
    ];

    for (const promo of promoCodes) {
      await connection.query(
        `INSERT INTO promo_codes (code, discount_type, discount_value, max_discount, min_purchase, usage_limit, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          promo.code,
          promo.discount_type,
          promo.discount_value,
          promo.max_discount,
          promo.min_purchase,
          promo.usage_limit,
          promo.status,
        ]
      );
      console.log(`✓ Added promo code: ${promo.code}`);
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Admin Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123\n');
    console.log('📦 Products Added: 10 (5 clothes + 5 sunglasses)');
    console.log('👥 Customers Added: 3');
    console.log('🎟️  Promo Codes Added: 3');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
    process.exit(0);
  }
}

seedDatabase().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
