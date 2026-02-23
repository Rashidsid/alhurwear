import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface PromoCode {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxUsage?: number;
  expiryDate?: string;
  description?: string;
}

interface PromoCodeRow {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_discount?: number;
  min_purchase?: number;
  usage_count: number;
  usage_limit?: number;
  expiry_date?: string | null;
  status: string;
}

// GET all promo codes or validate specific code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    const connection = await db.getConnection();

    if (code) {
      // Validate specific promo code
      const [rows] = await connection.query(
        `SELECT id, code, discount_type, discount_value, max_discount, min_purchase, 
                usage_limit, usage_count, expiry_date, status
         FROM promo_codes 
         WHERE code = ? AND status = 'active' AND (expiry_date IS NULL OR expiry_date >= CURDATE())`,
        [code.toUpperCase()]
      );
      
      connection.release();

      if ((rows as Array<PromoCodeRow>).length === 0) {
        return NextResponse.json(
          { error: 'Invalid or expired promo code' },
          { status: 404 }
        );
      }

      const promo = (rows as Array<PromoCodeRow>)[0];

      // Check usage limit
      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        return NextResponse.json(
          { error: 'Promo code usage limit exceeded' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        max_discount: promo.max_discount,
        min_purchase: promo.min_purchase
      });
    }

    // Get all promo codes
    const [rows] = await connection.query(
      `SELECT id, code, discount_type, discount_value, min_purchase, 
              usage_limit, usage_count, expiry_date, status, created_at
       FROM promo_codes 
       ORDER BY created_at DESC`
    );
    connection.release();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

// POST - Create new promo code
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PromoCode;

    // Validate required fields
    if (!body.code || !body.discountType || body.discountValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    // Check if code already exists
    const [existing] = await connection.query(
      "SELECT id FROM promo_codes WHERE code = ?",
      [body.code]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      connection.release();
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      );
    }

    // Insert new promo code
    const [result] = await connection.query(
      `INSERT INTO promo_codes 
       (code, discount_type, discount_value, min_order_amount, usage_limit, 
        expiry_date, description, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        body.code,
        body.discountType,
        body.discountValue,
        body.minOrderAmount || null,
        body.maxUsage || null,
        body.expiryDate || null,
        body.description || null,
        "Active",
      ] as (string | number | null)[]
    );

    connection.release();

    return NextResponse.json(
      { id: (result as { insertId: number }).insertId, ...body },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}
