import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST(req: Request) {
  try {
    const { phone, code, name, role } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    const isValid = db.verifyOtp(phone.trim(), code.trim());
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    let user = db.findUserByPhone(phone.trim());
    if (!user) {
      user = db.createUser(phone.trim(), name || 'Mandya Citizen', role || 'SEEKER');
    }

    const session = db.createSession(user.id);

    return NextResponse.json({
      success: true,
      token: session.token,
      user,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
