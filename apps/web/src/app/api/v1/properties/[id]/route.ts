import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAuthenticatedUser } from '@/app/api/v1/_lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const property = db.getPropertyById(params.id);
  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  // If not published, only owner or admin can view
  if (property.status !== 'PUBLISHED') {
    const user = await getAuthenticatedUser();
    if (!user || (user.id !== property.userId && user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'This property is not currently published' }, { status: 403 });
    }
  }

  return NextResponse.json({ property });
}
