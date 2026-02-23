import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface OrderUpdate {
  status?: string;
  shippingAddress?: string;
}

// GET single order with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await db.getConnection();

    // Get order details
    const [orderRows] = await connection.query(
      `SELECT o.id, o.customer_id, o.total_amount, o.status, o.shipping_address,
              o.created_at, c.name as customer_name, c.email, c.phone
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [id]
    );

    if (!Array.isArray(orderRows) || orderRows.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orderRows[0];

    // Get order items
    const [itemRows] = await connection.query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name as product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    connection.release();

    return NextResponse.json(
      {
        ...order,
        items: itemRows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as OrderUpdate;

    const connection = await db.getConnection();

    // Check if order exists
    const [existing] = await connection.query(
      "SELECT id FROM orders WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (body.status !== undefined) {
      updates.push("status = ?");
      values.push(body.status);
    }

    if (body.shippingAddress !== undefined) {
      updates.push("shipping_address = ?");
      values.push(body.shippingAddress);
    }

    updates.push("updated_at = NOW()");
    values.push(id);

    if (updates.length > 1) {
      const query = `UPDATE orders SET ${updates.join(", ")} WHERE id = ?`;
      await connection.query(query, values);
    }

    connection.release();

    return NextResponse.json(
      { message: "Order updated successfully", id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await db.getConnection();

    // Check if order exists
    const [existing] = await connection.query(
      "SELECT id FROM orders WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status to cancelled
    await connection.query(
      "UPDATE orders SET status = 'Cancelled', updated_at = NOW() WHERE id = ?",
      [id]
    );

    connection.release();

    return NextResponse.json(
      { message: "Order cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
