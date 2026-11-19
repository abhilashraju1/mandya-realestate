import { dbClient } from './client';
import { INITIAL_PROPERTIES } from '../../lib/mock-data';
import { formatAreaDisplay } from '@mandya-realestate/shared';

export async function seedInitialData(): Promise<void> {
  const userCount = await dbClient.query<{ count: string }>('SELECT COUNT(*) as count FROM users');
  if (parseInt(userCount.rows[0].count, 10) > 0) {
    return; // Already seeded
  }

  const now = new Date().toISOString();

  // Synthetic users for testing & development
  const users = [
    {
      id: 'user-admin-1',
      phone: '+919900011223',
      name: 'Mandya Admin',
      role: 'ADMIN',
      is_verified: true,
    },
    {
      id: 'user-owner-1',
      phone: '+919845012345',
      name: 'Raghavendra Gowda',
      role: 'OWNER',
      is_verified: true,
    },
    {
      id: 'user-agent-1',
      phone: '+919448198765',
      name: 'Cauvery Property Consultants',
      role: 'AGENT',
      is_verified: true,
    },
    {
      id: 'user-seeker-1',
      phone: '+919740011223',
      name: 'Suresh Gowda',
      role: 'SEEKER',
      is_verified: true,
    },
  ];

  for (const u of users) {
    await dbClient.query(
      `INSERT INTO users (id, phone, name, role, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $6)
       ON CONFLICT (id) DO NOTHING`,
      [u.id, u.phone, u.name, u.role, u.is_verified, now]
    );
  }

  // Seed initial properties
  for (let i = 0; i < INITIAL_PROPERTIES.length; i++) {
    const p = INITIAL_PROPERTIES[i];
    const assignedUserId = i % 2 === 0 ? 'user-owner-1' : 'user-agent-1';
    const areaDisplay = formatAreaDisplay(p.areaSqft, p.category, 'en');

    await dbClient.query(
      `INSERT INTO properties (
        id, user_id, property_code, title_en, title_kn, description_en, description_kn,
        category, transaction_type, price_inr, price_per_sqft, area_display, area_sqft,
        guntas, acres, taluk, locality_en, locality_kn, coordinates_lat, coordinates_lng,
        is_location_approximate, exact_survey_number, amenities, images, contact_preferences,
        seller_name, seller_phone, seller_role, status, view_count, enquiries_count,
        created_at, updated_at, published_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25,
        $26, $27, $28, $29, $30, $31,
        $32, $32, $32
      ) ON CONFLICT (id) DO NOTHING`,
      [
        p.id,
        assignedUserId,
        p.propertyCode,
        p.titleEn,
        p.titleKn,
        p.descriptionEn,
        p.descriptionKn,
        p.category,
        p.transactionType,
        p.priceInr,
        p.pricePerSqft || null,
        areaDisplay,
        p.areaSqft,
        p.areaGunta || null,
        p.areaAcre || null,
        p.location.taluk,
        p.location.localityEn,
        p.location.localityKn,
        p.location.latitude || 12.5238,
        p.location.longitude || 76.8969,
        p.addressGranularity === 'APPROXIMATE_RADIUS',
        null, // private survey number omitted from initial public seeds
        JSON.stringify(p.amenities || []),
        JSON.stringify(p.media || []),
        JSON.stringify({ allowPhoneCall: true, allowWhatsApp: true }),
        p.sellerName,
        p.sellerPhoneDirect,
        p.sellerType || 'OWNER',
        p.status,
        p.viewsCount || 0,
        p.enquiriesCount || 0,
        now,
      ]
    );
  }

  // Initial audit log
  await dbClient.query(
    `INSERT INTO moderation_audit_logs (id, property_id, actor_user_id, actor_name, action, reason, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [
      'log-initial-1',
      'prop-1',
      'user-admin-1',
      'Mandya Admin',
      'APPROVE',
      'Initial seed verification completed.',
      now,
    ]
  );

  // Initial Enquiry
  await dbClient.query(
    `INSERT INTO enquiries (
      id, property_id, property_code, seller_user_id, seeker_user_id,
      seeker_name, seeker_phone, message, idempotency_key, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id) DO NOTHING`,
    [
      'enq-initial-1',
      'prop-1',
      'MND-1001',
      'user-owner-1',
      'user-seeker-1',
      'Suresh Gowda',
      '+919740011223',
      'Is the price negotiable for immediate registration?',
      'idemp-enq-initial-1',
      'NEW',
      now,
    ]
  );

  // Initial Site Visit
  await dbClient.query(
    `INSERT INTO site_visits (
      id, property_id, property_code, seller_user_id, seeker_user_id,
      seeker_name, seeker_phone, preferred_date, preferred_time_slot, idempotency_key, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id) DO NOTHING`,
    [
      'vis-initial-1',
      'prop-1',
      'MND-1001',
      'user-owner-1',
      'user-seeker-1',
      'Suresh Gowda',
      '+919740011223',
      '2026-11-24',
      'MORNING',
      'idemp-vis-initial-1',
      'PENDING',
      now,
    ]
  );

  // Initial Favorite
  await dbClient.query(
    `INSERT INTO favorites (user_id, property_id, created_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, property_id) DO NOTHING`,
    ['user-seeker-1', 'prop-1', now]
  );
}
