import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAuthenticatedUser } from '@/app/api/v1/_lib/auth';
import { toPublicProperty } from '@/server/transformers/public';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const property = db.getPropertyById(params.id);
  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  const user = await getAuthenticatedUser();
  const isOwnerOrAdmin = user && (user.id === property.userId || user.role === 'ADMIN' || user.role === 'MODERATOR');

  // If not published, only owner or admin can view
  if (property.status !== 'PUBLISHED') {
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: 'This property is not currently published' }, { status: 403 });
    }
    return NextResponse.json({ property });
  }

  // Public view: apply allowlist transformer
  if (!isOwnerOrAdmin) {
    return NextResponse.json({ property: toPublicProperty(property) });
  }

  return NextResponse.json({ property });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const property = db.getPropertyById(params.id);
  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  const isOwner = user.id === property.userId;
  const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'You do not have permission to modify this property' }, { status: 403 });
  }

  try {
    const { status, reason } = await req.json();
    if (!status) {
      return NextResponse.json({ error: 'Target status is required' }, { status: 400 });
    }

    // Owner allowed transitions: PAUSED, SOLD_OR_RENTED, PENDING_APPROVAL (resubmit)
    // Admin allowed transitions: PUBLISHED, REJECTED, etc.
    if (!isAdmin && !['PAUSED', 'SOLD_OR_RENTED', 'PENDING_APPROVAL'].includes(status)) {
      return NextResponse.json({ error: 'Owners can only pause, mark sold, or resubmit listings' }, { status: 403 });
    }

    const success = db.updatePropertyStatus(params.id, status, { id: user.id, name: user.name }, reason);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update property status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
