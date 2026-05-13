import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    // Nota: Deberíamos tener un endpoint específico en el backend para esto o usar el de 'me'
    // Por ahora, usamos el endpoint de lista de usuarios filtrando si el que pide es admin,
    // o simplemente devolvemos el rol del token si es el mismo usuario.
    const token = request.headers.get('cookie')?.split('ergoai_token=')[1]?.split(';')[0];
    
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
        return NextResponse.json({ role: 'user' });
    }

    const userData = await response.json();
    return NextResponse.json({ role: userData.role });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ role: 'user', error: 'Internal Server Error' }, { status: 500 });
  }
}
