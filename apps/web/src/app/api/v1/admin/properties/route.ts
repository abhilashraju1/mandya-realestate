import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAuthenticatedUser } from '@/app/api/v1/_lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden: Admin or Moderator access required' }, { status: 403 });
  }

  const properties = db.getAllPropertiesForAdmin();
  return NextResponse.json({ properties });
}
