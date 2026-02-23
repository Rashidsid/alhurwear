import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface Customer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// GET all customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const connection = await db.getConnection();

    let query = `SELECT c.id, c.name, c.email, c.phone, c.address, c.created_at,
                 COUNT(o.id) as total_orders,
                 COALESCE(SUM(o.total_amount), 0) as total_spent,
                 MAX(o.created_at) as last_order_date
                 FROM customers c
                 LEFT JOIN orders o ON c.id = o.customer_id`;

    const params: string[] = [];

    if (search) {
      query += " WHERE c.name LIKE ? OR c.email LIKE ?";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += " GROUP BY c.id ORDER BY c.created_at DESC";

    const [rows] = await connection.query(query, params);
    connection.release();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Customer;

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    // Check if customer email already exists
    const [existing] = await connection.query(
      "SELECT id FROM customers WHERE email = ?",
      [body.email]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      connection.release();
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 }
      );
    }

    // Insert new customer
    const [result] = await connection.query(
      `INSERT INTO customers (name, email, phone, address, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [body.name, body.email, body.phone || null, body.address || null] as (string | null)[]
    );

    connection.release();

    return NextResponse.json(
      { id: (result as { insertId: number }).insertId, ...body },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
