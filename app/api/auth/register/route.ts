import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterBody | LoginBody;
    
    // Register endpoint
    if (request.headers.get('x-action') === 'register') {
      const { name, email, password } = body as RegisterBody;

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const connection = await pool.getConnection();

      // Check if user exists
      const [existing] = await connection.query(
        'SELECT id FROM customers WHERE email = ?',
        [email]
      );

      if ((existing as Array<{id: number}>).length > 0) {
        connection.release();
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }

      // Since we don't have proper password hashing library in this setup,
      // we'll store it as-is (NOT FOR PRODUCTION - use bcrypt in real app)
      await connection.query(
        'INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)',
        [name, email, '', password]
      );

      const token = jwt.sign({ email, name }, SECRET_KEY, { expiresIn: '7d' });

      connection.release();

      return NextResponse.json({
        message: 'User registered successfully',
        token,
        user: { name, email }
      });
    }

    // Login endpoint
    const { email, password } = body as LoginBody;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT id, name, email, password FROM customers WHERE email = ?',
      [email]
    );

    connection.release();

    if ((users as Array<{id: number; name: string; email: string; password: string}>).length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = (users as Array<{id: number; name: string; email: string; password: string}>)[0];

    // Simple password check (NOT FOR PRODUCTION)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
