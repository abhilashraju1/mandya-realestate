import os

BASE = "/home/5296658037_0/.gemini/antigravity/scratch/mandya-realestate/apps/web/src/app/api/v1"

def write(rel, content):
    full = os.path.join(BASE, rel)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created API Route: {rel}")

# 1. Auth Helper
auth_helper = """
import { headers } from 'next/headers';
import { db } from '../../../../server/db';

export async function getAuthenticatedUser() {
  const reqHeaders = await headers();
  const authHeader = reqHeaders.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace(/^Bearer\\s+/i, '').trim();
  if (!token) return null;

  const session = db.findSession(token);
  return session ? session.user : null;
}
"""
write("_lib/auth.ts", auth_helper)

# 2. OTP Send & Verify
otp_send = """
import { NextResponse } from 'next/server';
import { db } from '../../../../../server/db';

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
"""
write("auth/otp/send/route.ts", otp_send)

otp_verify = """
import { NextResponse } from 'next/server';
import { db } from '../../../../../server/db';

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
"""
write("auth/otp/verify/route.ts", otp_verify)

# 3. Auth Me
auth_me = """
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../_lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ user });
}
"""
write("auth/me/route.ts", auth_me)

# 4. Properties Search & Create
properties_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { getAuthenticatedUser } from '../_lib/auth';

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
"""
write("properties/route.ts", properties_route)

# 5. Property Detail by ID
property_detail_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { getAuthenticatedUser } from '../_lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const property = db.getPropertyById(params.id);
  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  // If not published, only owner or admin can view
  if (property.status !== 'PUBLISHED') {
    const user = await getAuthenticatedUser();
    if (!user || (user.id !== property.userId && user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'This property is not currently published' }, { status: 403 });
    }
  }

  return NextResponse.json({ property });
}
"""
write("properties/[id]/route.ts", property_detail_route)

# 6. My Properties
my_properties_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { getAuthenticatedUser } from '../_lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const properties = db.getUserProperties(user.id);
  return NextResponse.json({ properties });
}
"""
write("properties/my/route.ts", my_properties_route)

# 7. Admin Moderation
admin_properties_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { getAuthenticatedUser } from '../_lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Forbidden: Admin or Moderator access required' }, { status: 403 });
  }

  const properties = db.getAllPropertiesForAdmin();
  return NextResponse.json({ properties });
}
"""
write("admin/properties/route.ts", admin_properties_route)

admin_moderate_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../../server/db';
import { getAuthenticatedUser } from '../../_lib/auth';

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
"""
write("admin/properties/[id]/moderate/route.ts", admin_moderate_route)

# 8. Enquiries
enquiries_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { getAuthenticatedUser } from '../_lib/auth';

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
"""
write("enquiries/route.ts", enquiries_route)

my_enquiries_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { getAuthenticatedUser } from '../_lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Sellers get enquiries received on their properties
  const received = db.getEnquiriesForSeller(user.id);
  // Seekers get enquiries they sent
  const sent = db.getEnquiriesForSeeker(user.id);

  return NextResponse.json({ received, sent });
}
"""
write("enquiries/my/route.ts", my_enquiries_route)

# 9. Site Visits
site_visits_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { getAuthenticatedUser } from '../_lib/auth';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const user = await getAuthenticatedUser();

    if (!payload.propertyId || !payload.seekerPhone || !payload.preferredDate) {
      return NextResponse.json({ error: 'Property ID, phone, and date are required' }, { status: 400 });
    }

    const visit = {
      id: `vis-${Date.now()}`,
      propertyId: payload.propertyId,
      propertyCode: payload.propertyCode || 'MND',
      seekerName: payload.seekerName || user?.name || 'Seeker',
      seekerPhone: payload.seekerPhone,
      preferredDate: payload.preferredDate,
      preferredTimeSlot: payload.preferredTimeSlot || 'MORNING',
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    };

    const saved = db.addSiteVisit(visit, user?.id);
    return NextResponse.json({ success: true, siteVisit: saved }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to schedule visit' }, { status: 500 });
  }
}
"""
write("site-visits/route.ts", site_visits_route)

my_site_visits_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { getAuthenticatedUser } from '../_lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const visits = db.getSiteVisitsForSeller(user.id);
  return NextResponse.json({ siteVisits: visits });
}
"""
write("site-visits/my/route.ts", my_site_visits_route)

# 10. Favorites
favorites_route = """
import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { getAuthenticatedUser } from '../_lib/auth';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ favorites: [] });
  }
  const favs = db.getUserFavorites(user.id);
  return NextResponse.json({ favorites: favs });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { propertyId } = await req.json();
  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
  }

  const res = db.toggleFavorite(user.id, propertyId);
  return NextResponse.json({ success: true, ...res });
}
"""
write("favorites/route.ts", favorites_route)

print("All API Routes created!")
