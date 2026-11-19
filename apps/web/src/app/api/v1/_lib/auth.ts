import { headers, cookies } from 'next/headers';
import { db } from '@/server/db';
import { SESSION_COOKIE_NAME } from '@/server/auth/session';

export async function getAuthenticatedUser() {
  const reqHeaders = await headers();
  const authHeader = reqHeaders.get('authorization');
  let token: string | null = null;

  if (authHeader) {
    token = authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
  }

  if (!token) return null;

  const session = db.findSession(token);
  return session ? session.user : null;
}
