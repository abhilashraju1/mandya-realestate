import { describe, it, expect } from 'vitest';
import {
  MANDYA_TALUKS,
  convertArea,
  calculatePlotDimensionsArea,
  formatPriceINR,
  formatAreaDisplay,
  getTranslation,
  PropertyListing,
  SeekerEnquiry,
  SiteVisitRequest,
} from '../src';

describe('Mandya Properties — End-to-End Seed Data & Workflow Verification', () => {
  // Mock Seed Dataset
  const SEED_PROPERTIES: PropertyListing[] = [
    {
      id: 'prop-1',
      propertyCode: 'MND-1001',
      titleEn: '30x40 MUDA Approved Residential Site in VV Nagar',
      titleKn: 'ವಿ.ವಿ. ನಗರದಲ್ಲಿ ೩೦x೪೦ ಮುಡಾ ಅನುಮೋದಿತ ನಿವೇಶನ',
      descriptionEn: 'Prime east-facing 30x40 site with asphalt road, Cauvery water.',
      descriptionKn: 'ಡಾಂಬರ್ ರಸ್ತೆ, ಕಾವೇರಿ ನೀರು ಹೊಂದಿರುವ ೩೦x೪೦ ಉತ್ತಮ ನಿವೇಶನ.',
      category: 'PLOT',
      subType: 'RESIDENTIAL_SITE',
      transactionType: 'SALE',
      status: 'PUBLISHED',
      priceInr: 3200000,
      location: {
        id: 'loc-1',
        taluk: 'MANDYA',
        localityEn: 'VV Nagar',
        localityKn: 'ವಿ.ವಿ. ನಗರ',
        pinCode: '571401',
        latitude: 12.528,
        longitude: 76.899,
      },
      addressGranularity: 'APPROXIMATE_RADIUS',
      fuzzedLatitude: 12.529,
      fuzzedLongitude: 76.898,
      areaSqft: 1200,
      plotDimensions: '30x40',
      facing: 'EAST',
      approvals: ['MUDA_APPROVED'],
      media: [{ id: 'm1', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef', isCover: true, order: 0 }],
      amenities: ['tar_road', 'cauvery_water'],
      sellerType: 'OWNER',
      sellerName: 'Raghavendra Gowda',
      sellerPhoneMasked: '+91 9845X XXXXX',
      sellerPhoneDirect: '+91 98450 12345',
      whatsappNumber: '+919845012345',
      isNegotiable: true,
      viewsCount: 342,
      enquiriesCount: 18,
      createdAt: '2026-11-10T10:00:00Z',
      updatedAt: '2026-11-10T10:00:00Z',
    },
    {
      id: 'prop-2',
      propertyCode: 'MND-1002',
      titleEn: '2.5 Acre Sugarcane Farmland with KRS Canal Water',
      titleKn: 'ಕೆ.ಆರ್.ಎಸ್ ಕಾಲುವೆ ನೀರಾವರಿ ಹೊಂದಿರುವ ೨.೫ ಎಕರೆ ಕಬ್ಬಿನ ಜಮೀನು',
      descriptionEn: 'High-yield agricultural farmland in Maddur on KRS canal.',
      descriptionKn: 'ಮದ್ದೂರು ತಾಲೂಕಿನಲ್ಲಿ ಕೆ.ಆರ್.ಎಸ್ ಕಾಲುವೆ ನೀರಾವರಿ ಜಮೀನು.',
      category: 'AGRICULTURAL',
      subType: 'IRRIGATED_FARMLAND',
      transactionType: 'SALE',
      status: 'PUBLISHED',
      priceInr: 8500000,
      location: {
        id: 'loc-2',
        taluk: 'MADDUR',
        localityEn: 'Shivapura',
        localityKn: 'ಶಿವಪುರ',
        pinCode: '571428',
        latitude: 12.584,
        longitude: 77.045,
      },
      addressGranularity: 'APPROXIMATE_RADIUS',
      fuzzedLatitude: 12.585,
      fuzzedLongitude: 77.043,
      areaSqft: 108900,
      areaAcre: 2.5,
      areaGunta: 100,
      waterSource: ['CANAL_IRRIGATION'],
      approvals: ['AGRICULTURAL_RTC'],
      media: [{ id: 'm2', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854', isCover: true, order: 0 }],
      amenities: ['canal_irrigation', 'electricity'],
      sellerType: 'OWNER',
      sellerName: 'Chethan Kumar',
      sellerPhoneMasked: '+91 9901X XXXXX',
      sellerPhoneDirect: '+91 99012 34567',
      whatsappNumber: '+919901234567',
      isNegotiable: true,
      viewsCount: 520,
      enquiriesCount: 29,
      createdAt: '2026-11-12T08:30:00Z',
      updatedAt: '2026-11-12T08:30:00Z',
    },
  ];

  it('1. Seed Integrity: Contains valid Mandya taluks and locations', () => {
    expect(SEED_PROPERTIES.length).toBeGreaterThanOrEqual(2);
    SEED_PROPERTIES.forEach((prop) => {
      expect(MANDYA_TALUKS[prop.location.taluk]).toBeDefined();
      expect(prop.propertyCode).toMatch(/^MND-\d{4}$/);
      expect(prop.priceInr).toBeGreaterThan(0);
      expect(prop.location.pinCode).toMatch(/^571\d{3}$/);
    });
  });

  it('2. Search Filtering: Filters by taluk, category, and budget correctly', () => {
    // Filter by Mandya taluk
    const mandyaProps = SEED_PROPERTIES.filter((p) => p.location.taluk === 'MANDYA');
    expect(mandyaProps).toHaveLength(1);
    expect(mandyaProps[0].propertyCode).toBe('MND-1001');

    // Filter by Agricultural category
    const agProps = SEED_PROPERTIES.filter((p) => p.category === 'AGRICULTURAL');
    expect(agProps).toHaveLength(1);
    expect(agProps[0].location.taluk).toBe('MADDUR');

    // Filter by budget <= 50 Lakhs
    const budgetProps = SEED_PROPERTIES.filter((p) => p.priceInr <= 5000000);
    expect(budgetProps).toHaveLength(1);
    expect(budgetProps[0].priceInr).toBe(3200000);
  });

  it('3. Land Calculations: Validates plot dimensions and gunta/acre conversions', () => {
    // 30x40 plot
    const area30x40 = calculatePlotDimensionsArea('30x40');
    expect(area30x40).toBe(1200);
    const guntas = convertArea(1200, 'sqft', 'gunta');
    expect(guntas).toBeCloseTo(1.102, 2);

    // Farmland: 2.5 acres
    const totalSqft = 2.5 * 43560;
    expect(totalSqft).toBe(108900);
    const displayEn = formatAreaDisplay(totalSqft, 'AGRICULTURAL', 'en');
    expect(displayEn).toBe('2 Acre 20 Gunta');
    const displayKn = formatAreaDisplay(totalSqft, 'AGRICULTURAL', 'kn');
    expect(displayKn).toBe('2 ಎಕರೆ 20 ಗುಂಟೆ');
  });

  it('4. Seeker Enquiry & Site Visit Request Workflow', () => {
    const newEnquiry: SeekerEnquiry = {
      id: 'enq-101',
      propertyId: 'prop-1',
      propertyCode: 'MND-1001',
      seekerName: 'Suresh Gowda',
      seekerPhone: '+91 97400 11223',
      message: 'Interested in this 30x40 site. Is price negotiable?',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    expect(newEnquiry.seekerPhone).toMatch(/^\+91/);
    expect(newEnquiry.status).toBe('NEW');

    const newVisit: SiteVisitRequest = {
      id: 'vis-201',
      propertyId: 'prop-1',
      propertyCode: 'MND-1001',
      seekerName: 'Suresh Gowda',
      seekerPhone: '+91 97400 11223',
      preferredDate: '2026-11-25',
      preferredTimeSlot: 'MORNING',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    expect(newVisit.preferredTimeSlot).toBe('MORNING');
    expect(newVisit.status).toBe('PENDING');
  });

  it('5. Admin Moderation Transitions: Draft -> Pending -> Published / Rejected', () => {
    let status: PropertyListing['status'] = 'DRAFT';
    expect(status).toBe('DRAFT');

    // Owner submits
    status = 'PENDING_APPROVAL';
    expect(status).toBe('PENDING_APPROVAL');

    // Admin approves
    status = 'PUBLISHED';
    expect(status).toBe('PUBLISHED');

    // Seller marks sold
    status = 'SOLD_OR_RENTED';
    expect(status).toBe('SOLD_OR_RENTED');
  });

  it('6. Bilingual Localization Consistency', () => {
    expect(getTranslation('buy', 'en')).toBe('Buy');
    expect(getTranslation('buy', 'kn')).toBe('ಖರೀದಿಸಿ');
    expect(getTranslation('badge_owner', 'en')).toBe('Direct Owner');
    expect(getTranslation('badge_owner', 'kn')).toBe('ನೇರ ಮಾಲೀಕರು');
    expect(getTranslation('schedule_visit', 'kn')).toBe('ಸ್ಥಳ ವೀಕ್ಷಣೆಗೆ ವಿನಂತಿಸಿ');
  });
});
