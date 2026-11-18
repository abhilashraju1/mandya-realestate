import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAuthenticatedUser } from '@/app/api/v1/_lib/auth';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const user = await getAuthenticatedUser();

    if (!payload.propertyId || !payload.seekerPhone || !payload.seekerName) {
      return NextResponse.json({ error: 'Property ID, seeker phone, and seeker name are required' }, { status: 400 });
    }

    const enquiry = {
      id: `enq-${Date.now()}`,
      propertyId: payload.propertyId,
      propertyCode: payload.propertyCode || 'MND',
      seekerName: payload.seekerName,
      seekerPhone: payload.seekerPhone,
      message: payload.message || 'I am interested in this listing.',
      status: 'NEW' as const,
      createdAt: new Date().toISOString(),
    };

    const saved = db.addEnquiry(enquiry, user?.id);
    return NextResponse.json({ success: true, enquiry: saved }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to submit enquiry' }, { status: 500 });
  }
}
