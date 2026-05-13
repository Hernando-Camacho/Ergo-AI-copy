import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('ergoai_token=')[1]?.split(';')[0];
    
    const response = await fetch(`${BACKEND_URL}/users/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Unauthorized or Backend Error' }, { status: response.status });
    }

    const users = await response.json();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { email, role } = await request.json();
    const token = request.headers.get('cookie')?.split('ergoai_token=')[1]?.split(';')[0];

    const response = await fetch(`${BACKEND_URL}/users/${email}?role=${role}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to update role' }, { status: response.status });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
