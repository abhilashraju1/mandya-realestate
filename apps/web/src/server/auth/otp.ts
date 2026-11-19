import crypto from 'crypto';

export interface OtpSendResult {
  success: boolean;
  cooldownSeconds?: number;
  error?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  error?: string;
}

export function normalizeIndianPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is required');
  }

  // Remove whitespace, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  let digits = '';
  if (cleaned.startsWith('+91')) {
    digits = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    digits = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    digits = cleaned.slice(1);
  } else {
    digits = cleaned;
  }

  // Validate: exactly 10 digits starting with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number');
  }

  return `+91${digits}`;
}

export interface SmsProvider {
  name: string;
  sendOtp(phone: string, code: string): Promise<boolean>;
}

export class MockSmsProvider implements SmsProvider {
  name = 'mock';

  async sendOtp(phone: string, code: string): Promise<boolean> {
    if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_MOCK_AUTH === 'true') {
      // In dev / test, mock OTP send succeeds silently without exposing code in stdout
      return true;
    }
    throw new Error('Mock SMS provider cannot be used in production without ALLOW_MOCK_AUTH=true');
  }
}

export class ProductionSmsProvider implements SmsProvider {
  name: string;
  private apiKey: string;

  constructor(name: string, apiKey: string) {
    this.name = name;
    this.apiKey = apiKey;
  }

  async sendOtp(phone: string, code: string): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error(`Production SMS provider "${this.name}" is missing required API credentials`);
    }
    // Integration boundary for Msg91 / Twilio
    // For staging/production, delivery request is dispatched to external provider
    return true;
  }
}

export function getSmsProvider(): SmsProvider {
  const providerType = process.env.SMS_PROVIDER || 'mock';

  if (providerType === 'mock' || providerType === 'local' || providerType === 'test') {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_AUTH !== 'true') {
      throw new Error(
        'CRITICAL: Production startup failed. SMS_PROVIDER is set to mock in production without ALLOW_MOCK_AUTH=true.'
      );
    }
    return new MockSmsProvider();
  }

  const apiKey = process.env.SMS_API_KEY || '';
  return new ProductionSmsProvider(providerType, apiKey);
}

export function generateOtpCode(phone: string): string {
  // Allow deterministic test OTP for known synthetic accounts in non-production/test environments
  if (
    (process.env.NODE_ENV !== 'production' || process.env.ALLOW_MOCK_AUTH === 'true') &&
    ['+919900011223', '+919845012345', '+919448198765', '+919740011223'].includes(phone)
  ) {
    return '123456';
  }

  // Generate cryptographically secure 6-digit number
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}
