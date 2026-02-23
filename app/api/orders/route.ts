import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface Order {
  customerId: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress?: string;
  status?: string;
}

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const connection = await db.getConnection();

    let query =
      `SELECT o.id, o.customer_id, o.total_amount, o.status, 
              o.created_at, c.name as customer_name, c.email
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id`;

    const params: (string | null)[] = [];

    if (status) {
      query += " WHERE o.status = ?";
      params.push(status);
    }

    query += " ORDER BY o.created_at DESC";

    const [rows] = await connection.query(query, params);
    connection.release();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Order;

    // Validate required fields
    if (!body.customerId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    try {
      // Start transaction
      await connection.query("START TRANSACTION");

      // Insert order
      const [orderResult] = await connection.query(
        `INSERT INTO orders (customer_id, total_amount, status, shipping_address, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          body.customerId,
          body.totalAmount,
          body.status || "Pending",
          body.shippingAddress || null,
        ]
      );

      const orderId = (orderResult as { insertId: number }).insertId;

      // Insert order items
      for (const item of body.items) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [orderId, item.productId, item.quantity, item.price] as (number | string)[]
        );

        // Update product stock
        await connection.query(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [item.quantity, item.productId]
        );
      }

      // Commit transaction
      await connection.query("COMMIT");

      return NextResponse.json(
        { id: orderId, ...body },
        { status: 201 }
      );
    } catch (transactionError) {
      await connection.query("ROLLBACK");
      throw transactionError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
