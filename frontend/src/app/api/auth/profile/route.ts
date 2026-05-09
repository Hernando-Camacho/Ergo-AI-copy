import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const pool = new Pool({
  user: 'ergoai_user',
  host: '127.0.0.1',
  database: 'ergoai_db',
  password: 'ergoai_password',
  port: 5433,
});

const JWT_SECRET = new TextEncoder().encode('supersecretkey_ergoai_2026_secure');

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('ergoai_token=')[1]?.split(';')[0];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.sub;

    const { name, email, department, password } = await request.json();

    const client = await pool.connect();
    
    // 1. Actualizar datos básicos
    let query = 'UPDATE users SET full_name = $1, email = $2, department = $3 WHERE id = $4';
    let params = [name, email, department, userId];
    await client.query(query, params);

    // 2. Actualizar contraseña si se envió
    if (password && password.trim().length > 0) {
      const hashed = await bcrypt.hash(password, 10);
      await client.query('UPDATE users SET hashed_password = $1 WHERE id = $2', [hashed, userId]);
    }

    client.release();

    // 3. Generar nuevo token con datos actualizados
    const newToken = await new SignJWT({ 
      email, 
      role: payload.role, 
      name, 
      department,
      sub: userId 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true, message: 'Perfil actualizado' });
    response.cookies.set({
      name: 'ergoai_token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return response;

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Error actualizando perfil' }, { status: 500 });
  }
}
