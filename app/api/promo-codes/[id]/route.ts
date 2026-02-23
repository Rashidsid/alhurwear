import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface PromoCode {
  code?: string;
  discountType?: string;
  discountValue?: number;
  minOrderAmount?: number;
  maxUsage?: number;
  expiryDate?: string;
  description?: string;
  status?: string;
}

// GET single promo code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      `SELECT id, code, discount_type, discount_value, min_order_amount, 
              usage_limit, usage_count, expiry_date, description, status, created_at
       FROM promo_codes 
       WHERE id = ?`,
      [id]
    );
    connection.release();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching promo code:", error);
    return NextResponse.json(
      { error: "Failed to fetch promo code" },
      { status: 500 }
    );
  }
}

// PUT - Update promo code
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as PromoCode;

    const connection = await db.getConnection();

    // Check if promo code exists
    const [existing] = await connection.query(
      "SELECT id FROM promo_codes WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 404 }
      );
    }

    // Check if new code already exists (if code is being changed)
    if (body.code) {
      const [codeExists] = await connection.query(
        "SELECT id FROM promo_codes WHERE code = ? AND id != ?",
        [body.code, id]
      );

      if (Array.isArray(codeExists) && codeExists.length > 0) {
        connection.release();
        return NextResponse.json(
          { error: "Promo code already exists" },
          { status: 400 }
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.code !== undefined) {
      updates.push("code = ?");
      values.push(body.code);
    }
    if (body.discountType !== undefined) {
      updates.push("discount_type = ?");
      values.push(body.discountType);
    }
    if (body.discountValue !== undefined) {
      updates.push("discount_value = ?");
      values.push(body.discountValue);
    }
    if (body.minOrderAmount !== undefined) {
      updates.push("min_order_amount = ?");
      values.push(body.minOrderAmount);
    }
    if (body.maxUsage !== undefined) {
      updates.push("usage_limit = ?");
      values.push(body.maxUsage);
    }
    if (body.expiryDate !== undefined) {
      updates.push("expiry_date = ?");
      values.push(body.expiryDate);
    }
    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(body.description);
    }
    if (body.status !== undefined) {
      updates.push("status = ?");
      values.push(body.status);
    }

    updates.push("updated_at = NOW()");
    values.push(id);

    if (updates.length > 1) {
      const query = `UPDATE promo_codes SET ${updates.join(", ")} WHERE id = ?`;
      await connection.query(query, values);
    }

    connection.release();

    return NextResponse.json(
      { message: "Promo code updated successfully", id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating promo code:", error);
    return NextResponse.json(
      { error: "Failed to update promo code" },
      { status: 500 }
    );
  }
}

// DELETE - Delete promo code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connection = await db.getConnection();

    // Check if promo code exists
    const [existing] = await connection.query(
      "SELECT id FROM promo_codes WHERE id = ?",
      [id]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 404 }
      );
    }

    // Delete the promo code
    await connection.query("DELETE FROM promo_codes WHERE id = ?", [id]);
    connection.release();

    return NextResponse.json(
      { message: "Promo code deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return NextResponse.json(
      { error: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
