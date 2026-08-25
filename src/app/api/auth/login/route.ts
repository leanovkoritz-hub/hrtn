import { NextRequest, NextResponse } from 'next/server';
import { checkCredentials, createSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = body?.username;
  const password = body?.password;

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
  }

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  await createSessionCookie();
  return NextResponse.json({ ok: true });
}
