import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  description: string;
  stock: number;
  status: string;
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
      'SELECT id, name, category, price, original_price, description, stock, status, created_at FROM products WHERE id = ? AND status = "active"',
      [id]
    );
    
    const [images] = await connection.query(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      [id]
    );
    
    connection.release();

    if (!Array.isArray(products) || (products as Product[]).length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...(products as Product[])[0],
      images: (images as ProductImage[]).map(img => img.image_url),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
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
    const body = await request.json() as { 
      name: string
      category: string
      price: number
      original_price?: number
      description: string
      stock: number
      images?: string[]
    };
    const { name, category, price, original_price, description, stock, images } = body;

    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE products SET name = ?, category = ?, price = ?, original_price = ?, description = ?, stock = ? WHERE id = ?',
      [name, category, Math.round(price), original_price || price, description, Math.round(stock), id]
    );

    // Update images if provided
    if (images && images.length > 0) {
      await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      
      for (let i = 0; i < images.length; i++) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
          [id, images[i], i + 1]
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
    
    // Delete images first
    await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    
    // Delete product
    await connection.query('UPDATE products SET status = "inactive" WHERE id = ?', [id]);
    
    connection.release();

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
