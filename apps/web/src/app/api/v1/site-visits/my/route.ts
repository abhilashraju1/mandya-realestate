import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAuthenticatedUser } from '@/app/api/v1/_lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const visits = db.getSiteVisitsForSeller(user.id);
  return NextResponse.json({ siteVisits: visits });
}
