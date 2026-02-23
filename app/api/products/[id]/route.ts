import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  color: string;
  description: string;
  stock: number;
  is_hot_selling?: boolean;
  is_new_arrival?: boolean;
  is_top_viewed?: boolean;
}

interface ProductImage {
  image_url: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await pool.getConnection();
    const [products] = await connection.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    const [images] = await connection.query(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_main DESC',
      [id]
    );
    connection.release();

    if ((products as Product[]).length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...(products as Product[])[0],
      images: (images as ProductImage[]).map(img => img.image_url),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as { name: string; category: string; price: number; color: string; description: string; stock: number; images: string[]; is_hot_selling?: boolean; is_new_arrival?: boolean; is_top_viewed?: boolean };
    const { name, category, price, color, description, stock, images, is_hot_selling, is_new_arrival, is_top_viewed } = body;

    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE products SET name = ?, category = ?, price = ?, color = ?, description = ?, stock = ?, is_hot_selling = ?, is_new_arrival = ?, is_top_viewed = ? WHERE id = ?',
      [name, category, price, color, description, stock, is_hot_selling || false, is_new_arrival || false, is_top_viewed || false, id]
    );

    // Update images
    await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)',
          [id, images[i], i === 0]
        );
      }
    }

    connection.release();

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM products WHERE id = ?', [id]);
    connection.release();

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
