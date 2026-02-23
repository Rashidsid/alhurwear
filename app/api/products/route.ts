import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface Product {
  images?: string[] | string;
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  stock: number;
}

interface ProductImage {
  product_id: string;
  image_url: string;
}

interface InsertResult {
  insertId: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100);
    const search = searchParams.get('search');

    const connection = await pool.getConnection();
    
    // Optimized query: fetch only product data without joins
    let query = `
      SELECT p.id, p.name, p.category, p.price, p.original_price, p.description, p.stock, p.status, p.created_at
      FROM products p 
      WHERE p.status = 'active'
    `;
    
    const params: (string | number | null)[] = [];
    
    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [products] = await connection.query(query, params);
    
    // Fetch images separately for the products
    if ((products as Product[]).length > 0) {
      const productIds = (products as Product[]).map(p => p.id);
      const imageQuery = `
        SELECT product_id, image_url 
        FROM product_images 
        WHERE product_id IN (${productIds.map(() => '?').join(',')})
        ORDER BY display_order ASC
      `;
      
      const [images] = await connection.query(imageQuery, productIds);
      
      // Map images to products
      const imageMap = new Map<string, string[]>();
      (images as ProductImage[]).forEach(img => {
        if (!imageMap.has(img.product_id)) {
          imageMap.set(img.product_id, []);
        }
        imageMap.get(img.product_id)!.push(img.image_url);
      });
      
      (products as Product[]).forEach(p => {
        p.images = imageMap.get(p.id) || [];
      });
    } else {
      (products as Product[]).forEach(p => {
        p.images = [];
      });
    }
    
    connection.release();

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { 
      name: string
      category: string
      price: number
      original_price?: number
      description: string
      stock: number
      images: string[]
    };
    
    const { name, category, price, original_price, description, stock, images } = body;

    if (!name || !category || !price || price < 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      // Generate product ID based on category
      const categoryPrefix = category === 'clothes' ? 'CL' : 'SG';
      const randomNum = Math.floor(Math.random() * 10000);
      const productId = `${categoryPrefix}${randomNum}`;

      const [result] = await connection.query(
        'INSERT INTO products (id, name, category, price, original_price, description, stock, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [productId, name, category, Math.round(price), original_price || price, description, Math.round(stock), 'active']
      );

      // Insert product images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i];
          if (imageUrl && imageUrl.trim()) {
            await connection.query(
              'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
              [productId, imageUrl, i + 1]
            );
          }
        }
      }

      return NextResponse.json({ 
        id: productId, 
        message: 'Product created successfully' 
      }, { status: 201 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
