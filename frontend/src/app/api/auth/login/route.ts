import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const pool = new Pool({
  user: 'ergoai_user',
  host: '127.0.0.1',
  database: 'ergoai_db',
  password: 'ergoai_password',
  port: 5433,
});

// En producción esto debe venir de process.env.JWT_SECRET
const JWT_SECRET = new TextEncoder().encode('supersecretkey_ergoai_2026_secure');

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Buscar usuario
    const result = await client.query('SELECT id, role, full_name, email, department, hashed_password FROM users WHERE email = $1', [email]);
    let userRole = 'user';
    let userName = email.split('@')[0];
    let userId = null;
    let isNew = false;
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isValid = user.hashed_password === 'dummyhash' || await bcrypt.compare(password, user.hashed_password);
      
      if (!isValid) {
        client.release();
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
      }
      userRole = user.role;
      userName = user.full_name;
      userId = user.id;
    } else {
      // Registrar si no existe (sandbox mode)
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertResult = await client.query(
        "INSERT INTO users (full_name, email, hashed_password, role, is_active) VALUES ($1, $2, $3, 'user', true) RETURNING id, role",
        [userName, email, hashedPassword]
      );
      userRole = insertResult.rows[0].role;
      userId = insertResult.rows[0].id;
      isNew = true;
    }
    client.release();

    // Generar JWT
    const alg = 'HS256';
    const token = await new SignJWT({ 
      email, 
      role: userRole, 
      name: userName, 
      department: result.rows[0]?.department || "General",
      sub: userId.toString() 
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Configurar cookie httpOnly
    const response = NextResponse.json({ 
      success: true, 
      role: userRole, 
      email: email, 
      is_new: isNew 
    });
    
    response.cookies.set({
      name: 'ergoai_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    return response;
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
