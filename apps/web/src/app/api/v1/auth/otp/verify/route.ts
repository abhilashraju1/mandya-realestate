import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { normalizeIndianPhone } from '@/server/auth/otp';
import { validatePublicRole, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/server/auth/session';

export async function POST(req: Request) {
  try {
    const { phone, code, name, role } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    let cleanPhone: string;
    try {
      cleanPhone = normalizeIndianPhone(phone);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const isValid = db.verifyOtp(cleanPhone, String(code).trim());
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid, expired, or maximum attempts exceeded for OTP' }, { status: 401 });
    }

    let user = db.findUserByPhone(cleanPhone);
    if (!user) {
      const assignedRole = validatePublicRole(role || 'SEEKER');
      user = db.createUser(cleanPhone, (name && name.trim()) || 'Mandya Citizen', assignedRole);
    }

    const session = db.createSession(user.id);

    const response = NextResponse.json({
      success: true,
      token: session.token,
      user,
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: Math.floor(SESSION_DURATION_MS / 1000),
      path: '/',
    });

    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
