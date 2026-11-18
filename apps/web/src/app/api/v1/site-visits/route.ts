import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAuthenticatedUser } from '@/app/api/v1/_lib/auth';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const user = await getAuthenticatedUser();

    if (!payload.propertyId || !payload.seekerPhone || !payload.preferredDate) {
      return NextResponse.json({ error: 'Property ID, phone, and date are required' }, { status: 400 });
    }

    const visit = {
      id: `vis-${Date.now()}`,
      propertyId: payload.propertyId,
      propertyCode: payload.propertyCode || 'MND',
      seekerName: payload.seekerName || user?.name || 'Seeker',
      seekerPhone: payload.seekerPhone,
      preferredDate: payload.preferredDate,
      preferredTimeSlot: payload.preferredTimeSlot || 'MORNING',
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    };

    const saved = db.addSiteVisit(visit, user?.id);
    return NextResponse.json({ success: true, siteVisit: saved }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to schedule visit' }, { status: 500 });
  }
}
