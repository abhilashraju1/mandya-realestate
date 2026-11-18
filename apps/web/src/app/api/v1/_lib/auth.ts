import { headers } from 'next/headers';
import { db } from '@/server/db';

export async function getAuthenticatedUser() {
  const reqHeaders = await headers();
  const authHeader = reqHeaders.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const session = db.findSession(token);
  return session ? session.user : null;
}
