import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAuthenticatedUser } from '@/app/api/v1/_lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taluk = searchParams.get('taluk') || undefined;
  const transaction = searchParams.get('transaction') || undefined;
  const category = searchParams.get('category') || undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const query = searchParams.get('q') || undefined;

  const results = db.getPublishedProperties({ taluk, transaction, category, maxPrice, query });
  return NextResponse.json({
    total: results.length,
    properties: results,
  });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required to post listing' }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const newId = `prop-${Date.now()}`;
    const code = `MND-${Math.floor(1000 + Math.random() * 9000)}`;

    const property = {
      ...payload,
      id: newId,
      propertyCode: code,
      status: 'PENDING_APPROVAL',
      viewsCount: 0,
      enquiriesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = db.addProperty(property, user.id);
    return NextResponse.json({ success: true, property: saved }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to create listing' }, { status: 500 });
  }
}
