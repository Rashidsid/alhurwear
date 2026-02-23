import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface CustomerUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// GET single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await db.getConnection();

    // Get customer details
    const [customerRows] = await connection.query(
      `SELECT c.id, c.name, c.email, c.phone, c.address, c.created_at,
              COUNT(o.id) as total_orders,
              COALESCE(SUM(o.total_amount), 0) as total_spent,
              MAX(o.created_at) as last_order_date
       FROM customers c
       LEFT JOIN orders o ON c.id = o.customer_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    if (!Array.isArray(customerRows) || customerRows.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const customer = customerRows[0];

    // Get customer orders
    const [orderRows] = await connection.query(
      `SELECT id, total_amount, status, created_at
       FROM orders
       WHERE customer_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    connection.release();

    return NextResponse.json(
      {
        ...customer,
        orders: orderRows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as CustomerUpdate;

    const connection = await db.getConnection();

    // Check if customer exists
    const [existing] = await connection.query(
      "SELECT id FROM customers WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check if new email already exists (if email is being changed)
    if (body.email) {
      const [emailExists] = await connection.query(
        "SELECT id FROM customers WHERE email = ? AND id != ?",
        [body.email, id]
      );

      if (Array.isArray(emailExists) && emailExists.length > 0) {
        connection.release();
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Build update query
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (body.name !== undefined) {
      updates.push("name = ?");
      values.push(body.name);
    }
    if (body.email !== undefined) {
      updates.push("email = ?");
      values.push(body.email);
    }
    if (body.phone !== undefined) {
      updates.push("phone = ?");
      values.push(body.phone);
    }
    if (body.address !== undefined) {
      updates.push("address = ?");
      values.push(body.address);
    }

    updates.push("updated_at = NOW()");
    values.push(id);

    if (updates.length > 1) {
      const query = `UPDATE customers SET ${updates.join(", ")} WHERE id = ?`;
      await connection.query(query, values);
    }

    connection.release();

    return NextResponse.json(
      { message: "Customer updated successfully", id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await db.getConnection();

    // Check if customer exists
    const [existing] = await connection.query(
      "SELECT id FROM customers WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Delete customer (this will cascade if foreign keys are set)
    await connection.query("DELETE FROM customers WHERE id = ?", [id]);
    connection.release();

    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
