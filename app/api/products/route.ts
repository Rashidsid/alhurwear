import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface Product {
  images?: string;
}

interface InsertResult {
  insertId: number;
}

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [products] = await connection.query(`
      SELECT p.*, GROUP_CONCAT(pi.image_url) as images 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id 
      GROUP BY p.id 
      ORDER BY p.created_at DESC
    `);
    connection.release();

    const formattedProducts = (products as Product[]).map(p => ({
      ...p,
      images: p.images ? (p.images as string).split(',') : [],
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name: string; category: string; price: number; color: string; description: string; stock: number; images: string[]; is_hot_selling?: boolean; is_new_arrival?: boolean; is_top_viewed?: boolean };
    const { name, category, price, color, description, stock, images, is_hot_selling, is_new_arrival, is_top_viewed } = body;

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO products (name, category, price, color, description, stock, is_hot_selling, is_new_arrival, is_top_viewed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, price, color, description, stock, is_hot_selling || false, is_new_arrival || false, is_top_viewed || false]
    );

    const productId = (result as InsertResult).insertId;

    // Insert product images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)',
          [productId, images[i], i === 0]
        );
      }
    }

    connection.release();

    return NextResponse.json({ 
      id: productId, 
      message: 'Product created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
