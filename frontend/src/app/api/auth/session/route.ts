import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode('supersecretkey_ergoai_2026_secure');

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.split('ergoai_token=')[1]?.split(';')[0];

  if (!token) {
    return NextResponse.json({ error: 'No authenticated session' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      department: payload.department
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
