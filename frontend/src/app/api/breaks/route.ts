import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'ergoai_user',
  host: '127.0.0.1',
  database: 'ergoai_db',
  password: 'ergoai_password',
  port: 5433,
});

// GET /api/breaks?userId=2
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, user_id, start_time, duration_seconds, score, metrics FROM active_breaks WHERE user_id = $1 ORDER BY start_time DESC',
      [parseInt(userId, 10)]
    );
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[API/breaks GET]', error);
    return NextResponse.json({ error: 'DB Error' }, { status: 500 });
  }
}

// POST /api/breaks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, duration_seconds, score, metrics } = body;

    if (!user_id || !duration_seconds || score === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO active_breaks (user_id, duration_seconds, score, metrics)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, start_time, duration_seconds, score, metrics`,
      [parseInt(user_id, 10), duration_seconds, score, JSON.stringify(metrics || {})]
    );
    client.release();

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('[API/breaks POST]', error);
    return NextResponse.json({ error: 'DB Error', detail: String(error) }, { status: 500 });
  }
}
