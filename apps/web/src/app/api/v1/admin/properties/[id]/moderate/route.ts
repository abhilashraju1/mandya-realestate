import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAuthenticatedUser } from '@/app/api/v1/_lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden: Admin or Moderator access required' }, { status: 403 });
  }

  const { action, reason } = await req.json();
  if (!action || !['APPROVE', 'REJECT', 'PAUSE'].includes(action)) {
    return NextResponse.json({ error: 'Invalid moderation action' }, { status: 400 });
  }

  const targetStatus = action === 'APPROVE' ? 'PUBLISHED' : action === 'REJECT' ? 'REJECTED' : 'PAUSED';
  const success = db.updatePropertyStatus(params.id, targetStatus, { id: user.id, name: user.name }, reason);

  if (!success) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, status: targetStatus });
}
