import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'ergoai_user',
  host: 'localhost',
  database: 'ergoai_db',
  password: 'ergoai_password',
  port: 5433,
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, full_name, email, role, is_active FROM users ORDER BY id DESC');
    client.release();
    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { email, role } = await request.json();
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    const client = await pool.connect();
    await client.query('UPDATE users SET role = $1 WHERE email = $2', [role, email]);
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
