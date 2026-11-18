import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    // Development OTP: fixed 123456 for predictable tests
    const devCode = '123456';
    const result = db.createOrUpdateOtp(cleanPhone, devCode);

    if (!result.success) {
      return NextResponse.json(
        { error: `Please wait ${result.cooldown} seconds before requesting another OTP` },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      devHint: 'Use OTP 123456 for local verification',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
