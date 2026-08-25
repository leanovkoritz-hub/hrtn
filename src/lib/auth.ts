import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'simtrack_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 16) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set a long random value in your .env.local file.'
    );
  }

  return new TextEncoder().encode(secret);
}

export function checkCredentials(
  username: string,
  password: string
): boolean {
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass) return false;

  return username === validUser && password === validPass;
}

export async function createSessionCookie() {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return false;

  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };