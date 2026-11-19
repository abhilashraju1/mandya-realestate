import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'mandya_session';
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const ALLOWED_PUBLIC_ROLES = ['SEEKER', 'OWNER', 'AGENT'] as const;
export type PublicRole = (typeof ALLOWED_PUBLIC_ROLES)[number];

export function validatePublicRole(role: string): PublicRole {
  if (role === 'ADMIN' || role === 'MODERATOR') {
    throw new Error('Administrative and Moderator roles cannot be selected via public registration.');
  }
  if (!ALLOWED_PUBLIC_ROLES.includes(role as any)) {
    return 'SEEKER';
  }
  return role as PublicRole;
}

export function generateSecureSessionToken(): string {
  return `sess_${crypto.randomBytes(32).toString('hex')}`;
}

export function extractSessionToken(req: NextRequest): string | null {
  // Check Authorization: Bearer <token>
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // Check HTTP-only cookie
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  return null;
}

export function validateCsrfOrigin(req: NextRequest): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return true;
  }

  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  if (!origin || !host) {
    // In local dev/curl/test runners without origin header, allow
    return true;
  }

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch (e) {
    return false;
  }
}
