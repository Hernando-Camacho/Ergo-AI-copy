import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'ergoai_user',
  host: 'localhost',
  database: 'ergoai_db',
  password: 'ergoai_password',
  port: 5433,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT role FROM users WHERE email = $1', [email]);
    client.release();

    if (result.rows.length > 0) {
      return NextResponse.json({ role: result.rows[0].role });
    } else {
      return NextResponse.json({ role: 'user', error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ role: 'user', error: 'Internal Server Error' }, { status: 500 });
  }
}
