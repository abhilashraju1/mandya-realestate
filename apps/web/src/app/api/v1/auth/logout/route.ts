import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { db } from '@/server/db';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';

export async function POST() {
  const reqHeaders = await headers();
  const authHeader = reqHeaders.get('authorization');
  let token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : null;

  const cookieStore = await cookies();
  if (!token) {
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
  }

  if (token) {
    db.deleteSession(token);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
