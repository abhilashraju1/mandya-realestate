export type UserRole = 
  | 'GUEST'
  | 'SEEKER'
  | 'OWNER'
  | 'AGENT'
  | 'BUILDER'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type PropertyCategory = 
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'AGRICULTURAL'
  | 'PLOT';

export type PropertySubType =
  // Residential
  | 'INDEPENDENT_HOUSE'
  | 'VILLA'
  | 'APARTMENT'
  | 'FARM_HOUSE'
  | 'RESIDENTIAL_SITE'
  | 'GATED_COMMUNITY_PLOT'
  // Commercial
  | 'COMMERCIAL_SHOP'
  | 'OFFICE_SPACE'
  | 'SHOWROOM'
  | 'WAREHOUSE_GODOWN'
  | 'COMMERCIAL_LAND'
  // Agricultural
  | 'IRRIGATED_FARMLAND'
  | 'DRY_FARMLAND'
  | 'PLANTATION_FARMPLOT';

export type TransactionType = 'SALE' | 'RENT' | 'LEASE';

export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'PAUSED'
  | 'SOLD_OR_RENTED'
  | 'EXPIRED'
  | 'ARCHIVED';

export type FacingDirection =
  | 'EAST'
  | 'WEST'
  | 'NORTH'
  | 'SOUTH'
  | 'NORTH_EAST'
  | 'NORTH_WEST'
  | 'SOUTH_EAST'
  | 'SOUTH_WEST';

export type MandyaTaluk =
  | 'MANDYA'
  | 'MADDUR'
  | 'SRIRANGAPATNA'
  | 'PANDAVAPURA'
  | 'MALAVALLI'
  | 'NAGAMANGALA'
  | 'KRISHNARAJAPETE';

export type ApprovalType =
  | 'MUDA_APPROVED'
  | 'DTCP_APPROVED'
  | 'GRAM_PANCHAYAT_FORM_9_11'
  | 'RERA_REGISTERED'
  | 'REVENUE_CONVERTED_DC'
  | 'AGRICULTURAL_RTC'
  | 'OTHER';

export type WaterSource =
  | 'BOREWELL'
  | 'CANAL_IRRIGATION'
  | 'OPEN_WELL'
  | 'MUNICIPAL_SUPPLY'
  | 'NONE';

export interface LocationInfo {
  id: string;
  taluk: MandyaTaluk;
  localityEn: string;
  localityKn: string;
  landmarkEn?: string;
  landmarkKn?: string;
  pinCode: string;
  latitude: number;
  longitude: number;
}

export interface PropertyMedia {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  isCover: boolean;
  order: number;
}

export interface PropertyListing {
  id: string;
  propertyCode: string; // e.g. "MND-1042"
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  category: PropertyCategory;
  subType: PropertySubType;
  transactionType: TransactionType;
  status: PropertyStatus;
  
  // Pricing
  priceInr: number;
  pricePerSqft?: number;
  pricePerGunta?: number;
  isNegotiable: boolean;
  rentDepositInr?: number;
  monthlyMaintenanceInr?: number;
  
  // Location
  location: LocationInfo;
  addressGranularity: 'LOCALITY_ONLY' | 'APPROXIMATE_RADIUS' | 'EXACT_LANDMARK';
  fuzzedLatitude: number;
  fuzzedLongitude: number;
  
  // Land & Dimensions
  areaSqft: number;
  areaGunta?: number;
  areaAcre?: number;
  plotDimensions?: string; // e.g. "30x40", "40x60"
  facing?: FacingDirection;
  roadWidthFt?: number;
  isCornerPlot?: boolean;
  
  // Building Attributes (Residential / Commercial)
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  totalFloors?: number;
  floorNumber?: number;
  furnishingStatus?: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
  ageOfPropertyYears?: number;
  carParkingCount?: number;
  
  // Agricultural & Land Specific
  waterSource?: WaterSource[];
  soilType?: string;
  currentCrops?: string[];
  hasElectricityConnection?: boolean;
  isFenced?: boolean;
  
  // Legal & Regulatory
  approvals?: ApprovalType[];
  karnatakaReraNumber?: string;
  isReraRegistered?: boolean;
  
  // Media & Badges
  media: PropertyMedia[];
  amenities: string[];
  isFeatured?: boolean;
  isVerified?: boolean;
  sellerType: 'OWNER' | 'AGENT' | 'BUILDER';
  sellerName: string;
  sellerPhoneMasked: string;
  sellerPhoneDirect: string; // unmasked only for authorized contact
  whatsappNumber: string;
  
  // Metadata
  viewsCount: number;
  enquiriesCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface SeekerEnquiry {
  id: string;
  propertyId: string;
  propertyCode: string;
  seekerName: string;
  seekerPhone: string;
  message: string;
  preferredContactTime?: string;
  status: 'NEW' | 'CONTACTED' | 'VISIT_SCHEDULED' | 'CLOSED';
  createdAt: string;
}

export interface SiteVisitRequest {
  id: string;
  propertyId: string;
  propertyCode: string;
  seekerName: string;
  seekerPhone: string;
  preferredDate: string;
  preferredTimeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
  status: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}
