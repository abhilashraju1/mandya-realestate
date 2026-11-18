import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAuthenticatedUser } from '@/app/api/v1/_lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Sellers get enquiries received on their properties
  const received = db.getEnquiriesForSeller(user.id);
  // Seekers get enquiries they sent
  const sent = db.getEnquiriesForSeeker(user.id);

  return NextResponse.json({ received, sent });
}
