import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface CartItem {
  id: number;
  quantity: number;
}

interface OrderBody {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  promoCode?: string;
  items: CartItem[];
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as OrderBody;
    const { customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, items, total, promoCode } = body;

    if (!customerName || !customerEmail || !items.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, total_amount, payment_method, shipping_address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderNumber, customerName, customerEmail, customerPhone, total, paymentMethod, shippingAddress]
    );

    const orderId = (orderResult as {insertId: number}).insertId;

    // Add order items
    for (const item of items) {
      const [product] = await connection.query(
        'SELECT name, price FROM products WHERE id = ?',
        [item.id]
      );

      if ((product as Array<{name: string; price: number}>).length > 0) {
        const prod = (product as Array<{name: string; price: number}>)[0];
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.id, prod.name, item.quantity, prod.price]
        );

        // Update product stock
        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.id]
        );
      }
    }

    // If promo code used, mark it as used
    if (promoCode) {
      await connection.query(
        'UPDATE promo_codes SET usage_count = usage_count + 1 WHERE code = ?',
        [promoCode]
      );
    }

    connection.release();

    return NextResponse.json({
      message: 'Order created successfully',
      orderId,
      orderNumber,
      status: 'pending'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const customerEmail = searchParams.get('email');

    const connection = await pool.getConnection();

    if (orderId) {
      // Get specific order
      const [orders] = await connection.query(
        `SELECT o.*, 
                GROUP_CONCAT(JSON_OBJECT('id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name, 'quantity', oi.quantity, 'unit_price', oi.unit_price)) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.id = ?
         GROUP BY o.id`,
        [orderId]
      );

      connection.release();

      if ((orders as Array<unknown>).length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const order = (orders as Array<unknown>)[0];
      return NextResponse.json(order);
    }

    if (customerEmail) {
      // Get customer orders
      const [orders] = await connection.query(
        `SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC`,
        [customerEmail]
      );

      connection.release();
      return NextResponse.json(orders);
    }

    connection.release();
    return NextResponse.json({ error: 'No filters provided' }, { status: 400 });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
