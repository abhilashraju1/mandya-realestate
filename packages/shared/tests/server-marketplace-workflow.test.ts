import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../../apps/web/src/server/db';
import { PropertyListing } from '../src';

describe('Server Marketplace — Full Lifecycle & Permission Boundaries', () => {
  const TEST_OWNER_PHONE = '+919845012345';
  const TEST_ADMIN_PHONE = '+919900011223';
  const TEST_SEEKER_PHONE = '+919740011223';

  it('1. Mobile OTP: sends rate-limited OTP and verifies with single-use session', () => {
    // Send OTP
    const sendResult = db.createOrUpdateOtp(TEST_OWNER_PHONE, '123456');
    expect(sendResult.success).toBe(true);

    // Immediate resend triggers cooldown
    const cooldownResult = db.createOrUpdateOtp(TEST_OWNER_PHONE, '123456');
    expect(cooldownResult.success).toBe(false);
    expect(cooldownResult.cooldown).toBeGreaterThan(0);

    // Verify with invalid code fails
    const invalidVerify = db.verifyOtp(TEST_OWNER_PHONE, '999999');
    expect(invalidVerify).toBe(false);

    // Verify with correct code succeeds
    const validVerify = db.verifyOtp(TEST_OWNER_PHONE, '123456');
    expect(validVerify).toBe(true);

    // Code is single-use, second verification fails
    const secondVerify = db.verifyOtp(TEST_OWNER_PHONE, '123456');
    expect(secondVerify).toBe(false);

    // Create session
    const owner = db.findUserByPhone(TEST_OWNER_PHONE);
    expect(owner).toBeDefined();
    const session = db.createSession(owner!.id);
    expect(session.token).toMatch(/^sess_/);

    // Session resolution returns user
    const resolved = db.findSession(session.token);
    expect(resolved).not.toBeNull();
    expect(resolved?.user.id).toBe(owner!.id);
  });

  it('2. Listing Submission & Initial Moderation Queue (PENDING_APPROVAL)', () => {
    const owner = db.findUserByPhone(TEST_OWNER_PHONE)!;
    const testPropId = `prop-test-${Date.now()}`;
    const testCode = `MND-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProperty: PropertyListing = {
      id: testPropId,
      propertyCode: testCode,
      titleEn: '40x60 Gated Site in Srirangapatna',
      titleKn: 'ಶ್ರೀರಂಗಪಟ್ಟಣದಲ್ಲಿ ೪೦x೬೦ ನಿವೇಶನ',
      descriptionEn: 'Clear title DTCP approved plot near expressway.',
      descriptionKn: 'ಹೆದ್ದಾರಿ ಹತ್ತಿರವಿರುವ ಡಿಟಿಸಿಪಿ ನಿವೇಶನ.',
      category: 'PLOT',
      subType: 'RESIDENTIAL_SITE',
      transactionType: 'SALE',
      status: 'PENDING_APPROVAL',
      priceInr: 4500000,
      location: {
        id: 'loc-sri-1',
        taluk: 'SRIRANGAPATNA',
        localityEn: 'Paschimavahini',
        localityKn: 'ಪಶ್ಚಿಮವಾಹಿನಿ',
        pinCode: '571438',
        latitude: 12.418,
        longitude: 76.694,
      },
      addressGranularity: 'APPROXIMATE_RADIUS',
      fuzzedLatitude: 12.419,
      fuzzedLongitude: 76.695,
      areaSqft: 2400,
      plotDimensions: '40x60',
      media: [{ id: 'm1', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef', isCover: true, order: 0 }],
      amenities: ['tar_road', 'cauvery_water'],
      sellerType: 'OWNER',
      sellerName: owner.name,
      sellerPhoneMasked: '+91 98XXX XXXXX',
      sellerPhoneDirect: owner.phone,
      whatsappNumber: owner.phone,
      isNegotiable: true,
      viewsCount: 0,
      enquiriesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addProperty(newProperty, owner.id);

    // Verify it is NOT in public search yet
    const publicResultsBefore = db.getPublishedProperties({ query: testCode });
    expect(publicResultsBefore.find((p) => p.id === testPropId)).toBeUndefined();

    // Verify it IS in the admin queue
    const adminQueue = db.getAllPropertiesForAdmin();
    const queued = adminQueue.find((p) => p.id === testPropId);
    expect(queued).toBeDefined();
    expect(queued?.status).toBe('PENDING_APPROVAL');

    // Admin approves the listing
    const admin = db.findUserByPhone(TEST_ADMIN_PHONE)!;
    const approved = db.updatePropertyStatus(testPropId, 'PUBLISHED', { id: admin.id, name: admin.name }, 'Verified documents');
    expect(approved).toBe(true);

    // Verify it is NOW live in public search
    const publicResultsAfter = db.getPublishedProperties({ query: testCode });
    expect(publicResultsAfter.find((p) => p.id === testPropId)).toBeDefined();

    // Verify direct detail URL access
    const directDetail = db.getPropertyById(testPropId);
    expect(directDetail).toBeDefined();
    expect(directDetail?.status).toBe('PUBLISHED');
  });

  it('3. Lead Persistence, Data Isolation & Retry Idempotency', () => {
    const owner = db.findUserByPhone(TEST_OWNER_PHONE)!;
    const seeker = db.findUserByPhone(TEST_SEEKER_PHONE)!;

    // Seeker submits enquiry
    const enqPayload = {
      id: `enq-test-${Date.now()}`,
      propertyId: 'prop-1',
      propertyCode: 'MND-1001',
      seekerName: seeker.name,
      seekerPhone: seeker.phone,
      message: 'Looking to purchase this month.',
      status: 'NEW' as const,
      createdAt: new Date().toISOString(),
    };

    const firstSave = db.addEnquiry(enqPayload, seeker.id);
    expect(firstSave.id).toBeDefined();

    // Immediate retry does not create a duplicate record
    const retrySave = db.addEnquiry(enqPayload, seeker.id);
    expect(retrySave.id).toBe(firstSave.id);

    // Data isolation: listing owner sees the enquiry
    const ownerEnquiries = db.getEnquiriesForSeller(owner.id);
    expect(ownerEnquiries.some((e) => e.propertyId === 'prop-1')).toBe(true);

    // Unrelated user does not see this enquiry in their inbox
    const otherOwnerEnquiries = db.getEnquiriesForSeller('unrelated-user-999');
    expect(otherOwnerEnquiries.length).toBe(0);
  });

  it('4. Site Visit Scheduling & Status Transitions', () => {
    const owner = db.findUserByPhone(TEST_OWNER_PHONE)!;
    const seeker = db.findUserByPhone(TEST_SEEKER_PHONE)!;

    const visitPayload = {
      id: `vis-test-${Date.now()}`,
      propertyId: 'prop-1',
      propertyCode: 'MND-1001',
      seekerName: seeker.name,
      seekerPhone: seeker.phone,
      preferredDate: '2026-11-28',
      preferredTimeSlot: 'MORNING' as const,
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    };

    const visit = db.addSiteVisit(visitPayload, seeker.id);
    expect(visit.status).toBe('PENDING');

    // Owner confirms visit
    const confirmed = db.updateSiteVisitStatus(visit.id, 'CONFIRMED', owner.id);
    expect(confirmed).toBe(true);

    const ownerVisits = db.getSiteVisitsForSeller(owner.id);
    const updatedVisit = ownerVisits.find((v) => v.id === visit.id);
    expect(updatedVisit?.status).toBe('CONFIRMED');
  });

  it('5. Withdrawal / Sold Transition: Immediately leaves public search', () => {
    const owner = db.findUserByPhone(TEST_OWNER_PHONE)!;
    const testPropId = 'prop-1';

    // Mark as SOLD_OR_RENTED
    db.updatePropertyStatus(testPropId, 'SOLD_OR_RENTED', { id: owner.id, name: owner.name }, 'Property sold to local buyer');

    // Verify it leaves public search
    const published = db.getPublishedProperties();
    expect(published.find((p) => p.id === testPropId)).toBeUndefined();

    // Restore to published for subsequent tests
    const admin = db.findUserByPhone(TEST_ADMIN_PHONE)!;
    db.updatePropertyStatus(testPropId, 'PUBLISHED', { id: admin.id, name: admin.name });
  });
});
