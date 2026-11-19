import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { normalizeIndianPhone, generateOtpCode, getSmsProvider } from '@/server/auth/otp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = body;
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Valid phone number is required' }, { status: 400 });
    }

    let cleanPhone: string;
    try {
      cleanPhone = normalizeIndianPhone(phone);
    } catch (valErr: any) {
      return NextResponse.json({ error: valErr.message }, { status: 400 });
    }

    const code = generateOtpCode(cleanPhone);
    const result = db.createOrUpdateOtp(cleanPhone, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || `Please wait ${result.cooldown} seconds before requesting another OTP` },
        { status: 429 }
      );
    }

    // Dispatch via configured SMS provider
    const provider = getSmsProvider();
    await provider.sendOtp(cleanPhone, code);

    const isNonProd = process.env.NODE_ENV !== 'production' || process.env.ALLOW_MOCK_AUTH === 'true';

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      phone: cleanPhone,
      ...(isNonProd ? { devHint: 'Use OTP 123456 for local testing' } : {}),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}
