import { PropertyListing } from '@mandya-realestate/shared';

export interface PublicPropertyListing {
  id: string;
  propertyCode: string;
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  category: PropertyListing['category'];
  transactionType: PropertyListing['transactionType'];
  priceInr: number;
  pricePerSqft?: number;
  areaDisplay: string;
  areaSqft: number;
  guntas?: number;
  acres?: number;
  location: {
    taluk: PropertyListing['location']['taluk'];
    localityEn: string;
    localityKn: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    isApproximate: boolean;
  };
  amenities: string[];
  images: string[];
  contactPreferences: {
    allowPhoneCall: boolean;
    allowWhatsApp: boolean;
  };
  sellerName: string;
  sellerRole: string;
  sellerPhone?: string;
  status: 'PUBLISHED';
  viewCount: number;
  enquiriesCount: number;
  publishedAt: string;
  createdAt: string;
}

export function toPublicProperty(raw: any): PublicPropertyListing {
  // Approximate / fuzzed coordinates
  let lat = raw.coordinates_lat ? parseFloat(raw.coordinates_lat) : raw.location?.coordinates?.lat;
  let lng = raw.coordinates_lng ? parseFloat(raw.coordinates_lng) : raw.location?.coordinates?.lng;

  const isApproximate = raw.is_location_approximate ?? raw.location?.isApproximate ?? true;

  if (isApproximate && lat && lng) {
    // Fuzz to ~2 decimal places for public privacy (within Mandya taluk zone)
    lat = Math.round(lat * 100) / 100;
    lng = Math.round(lng * 100) / 100;
  }

  const contactPrefs =
    typeof raw.contact_preferences === 'string'
      ? JSON.parse(raw.contact_preferences)
      : raw.contactPreferences || { allowPhoneCall: true, allowWhatsApp: true };

  const amenities =
    typeof raw.amenities === 'string' ? JSON.parse(raw.amenities) : raw.amenities || [];

  const images = typeof raw.images === 'string' ? JSON.parse(raw.images) : raw.images || [];

  return {
    id: raw.id,
    propertyCode: raw.property_code || raw.propertyCode,
    titleEn: raw.title_en || raw.titleEn,
    titleKn: raw.title_kn || raw.titleKn,
    descriptionEn: raw.description_en || raw.descriptionEn,
    descriptionKn: raw.description_kn || raw.descriptionKn,
    category: raw.category,
    transactionType: raw.transaction_type || raw.transactionType,
    priceInr: parseFloat(raw.price_inr || raw.priceInr),
    pricePerSqft: raw.price_per_sqft ? parseFloat(raw.price_per_sqft) : raw.pricePerSqft,
    areaDisplay: raw.area_display || raw.areaDisplay,
    areaSqft: parseFloat(raw.area_sqft || raw.areaSqft),
    guntas: raw.guntas ? parseFloat(raw.guntas) : undefined,
    acres: raw.acres ? parseFloat(raw.acres) : undefined,
    location: {
      taluk: raw.taluk || raw.location?.taluk,
      localityEn: raw.locality_en || raw.location?.localityEn,
      localityKn: raw.locality_kn || raw.location?.localityKn,
      coordinates: lat && lng ? { lat, lng } : undefined,
      isApproximate: true,
    },
    amenities,
    images,
    contactPreferences: contactPrefs,
    sellerName: raw.seller_name || raw.sellerName,
    sellerRole: raw.seller_role || raw.sellerRole || 'OWNER',
    // Expose phone only if seller permitted phone calls
    sellerPhone: contactPrefs.allowPhoneCall ? raw.seller_phone || raw.sellerPhone : undefined,
    status: 'PUBLISHED',
    viewCount: parseInt(raw.view_count || raw.viewCount || '0', 10),
    enquiriesCount: parseInt(raw.enquiries_count || raw.enquiriesCount || '0', 10),
    publishedAt: raw.published_at || raw.publishedAt || raw.created_at || raw.createdAt,
    createdAt: raw.created_at || raw.createdAt,
  };
}

export function toPublicProperties(list: any[]): PublicPropertyListing[] {
  return list.filter((p) => (p.status === 'PUBLISHED')).map(toPublicProperty);
}
