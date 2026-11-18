import fs from 'fs';
import path from 'path';
import { PropertyListing, SeekerEnquiry, SiteVisitRequest } from '@mandya-realestate/shared';
import { INITIAL_PROPERTIES } from '../lib/mock-data';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: 'GUEST' | 'SEEKER' | 'OWNER' | 'AGENT' | 'MODERATOR' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
  used: boolean;
  resendCooldownUntil: number;
}

export interface ModerationAuditLog {
  id: string;
  propertyId: string;
  actorUserId: string;
  actorName: string;
  action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'PAUSE' | 'MARK_SOLD' | 'RESUBMIT';
  reason?: string;
  timestamp: string;
}

export interface FavoriteRecord {
  userId: string;
  propertyId: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  otpRecords: OtpRecord[];
  properties: (PropertyListing & { userId: string; rejectionReason?: string })[];
  enquiries: (SeekerEnquiry & { sellerUserId: string; seekerUserId?: string })[];
  siteVisits: (SiteVisitRequest & { sellerUserId: string; seekerUserId?: string })[];
  favorites: FavoriteRecord[];
  auditLogs: ModerationAuditLog[];
}

const DB_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'mandya-marketplace.json');

// Default initial state
function getDefaultData(): DatabaseSchema {
  // Pre-seed test users
  const adminUser: User = {
    id: 'user-admin-1',
    phone: '+919900011223',
    name: 'Mandya Admin',
    role: 'ADMIN',
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  const ownerUser: User = {
    id: 'user-owner-1',
    phone: '+919845012345',
    name: 'Raghavendra Gowda',
    role: 'OWNER',
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  const agentUser: User = {
    id: 'user-agent-1',
    phone: '+919448198765',
    name: 'Cauvery Property Consultants',
    role: 'AGENT',
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  const seekerUser: User = {
    id: 'user-seeker-1',
    phone: '+919740011223',
    name: 'Suresh Gowda',
    role: 'SEEKER',
    isVerified: true,
    createdAt: new Date().toISOString(),
  };

  // Map INITIAL_PROPERTIES to owners
  const properties = INITIAL_PROPERTIES.map((p, idx) => ({
    ...p,
    userId: idx % 2 === 0 ? ownerUser.id : agentUser.id,
  }));

  return {
    users: [adminUser, ownerUser, agentUser, seekerUser],
    sessions: [],
    otpRecords: [],
    properties,
    enquiries: [
      {
        id: 'enq-initial-1',
        propertyId: 'prop-1',
        propertyCode: 'MND-1001',
        sellerUserId: ownerUser.id,
        seekerUserId: seekerUser.id,
        seekerName: seekerUser.name,
        seekerPhone: seekerUser.phone,
        message: 'Is the price negotiable for immediate registration?',
        status: 'NEW',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    siteVisits: [
      {
        id: 'vis-initial-1',
        propertyId: 'prop-1',
        propertyCode: 'MND-1001',
        sellerUserId: ownerUser.id,
        seekerUserId: seekerUser.id,
        seekerName: seekerUser.name,
        seekerPhone: seekerUser.phone,
        preferredDate: '2026-11-24',
        preferredTimeSlot: 'MORNING',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    favorites: [
      {
        userId: seekerUser.id,
        propertyId: 'prop-1',
        createdAt: new Date().toISOString(),
      },
    ],
    auditLogs: [
      {
        id: 'log-1',
        propertyId: 'prop-1',
        actorUserId: adminUser.id,
        actorName: adminUser.name,
        action: 'APPROVE',
        reason: 'Verified MUDA A-khata layout documents.',
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

class MarketplaceDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed reading DB file, using default data:', e);
    }
    const def = getDefaultData();
    this.persist(def);
    return def;
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed saving DB file:', e);
    }
  }

  private save() {
    this.persist(this.data);
  }

  // --- Users & Auth ---
  findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  findUserByPhone(phone: string): User | undefined {
    return this.data.users.find((u) => u.phone === phone);
  }

  createUser(phone: string, name: string, role: User['role'] = 'SEEKER'): User {
    const user: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      phone,
      name,
      role,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  createOrUpdateOtp(phone: string, code: string): { success: boolean; cooldown?: number } {
    const now = Date.now();
    const existing = this.data.otpRecords.find((o) => o.phone === phone);

    if (existing && existing.resendCooldownUntil > now) {
      return { success: false, cooldown: Math.ceil((existing.resendCooldownUntil - now) / 1000) };
    }

    const expiresAt = now + 5 * 60 * 1000; // 5 mins
    const resendCooldownUntil = now + 30 * 1000; // 30s cooldown

    if (existing) {
      existing.code = code;
      existing.expiresAt = expiresAt;
      existing.used = false;
      existing.resendCooldownUntil = resendCooldownUntil;
    } else {
      this.data.otpRecords.push({ phone, code, expiresAt, used: false, resendCooldownUntil });
    }

    this.save();
    return { success: true };
  }

  verifyOtp(phone: string, code: string): boolean {
    const now = Date.now();
    const record = this.data.otpRecords.find(
      (o) => o.phone === phone && o.code === code && !o.used && o.expiresAt > now
    );
    if (!record) return false;

    record.used = true;
    this.save();
    return true;
  }

  createSession(userId: string): Session {
    const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const session: Session = { token, userId, expiresAt };
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  findSession(token: string): (Session & { user: User }) | null {
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) return null;

    const user = this.findUserById(session.userId);
    if (!user) return null;

    return { ...session, user };
  }

  deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.save();
  }

  // --- Properties & Moderation ---
  getPublishedProperties(filters?: {
    taluk?: string;
    transaction?: string;
    category?: string;
    maxPrice?: number;
    query?: string;
  }): PropertyListing[] {
    return this.data.properties.filter((prop) => {
      if (prop.status !== 'PUBLISHED') return false;

      if (filters?.taluk && filters.taluk !== 'ALL' && prop.location.taluk !== filters.taluk) {
        return false;
      }
      if (filters?.transaction && filters.transaction !== 'ALL' && prop.transactionType !== filters.transaction) {
        return false;
      }
      if (filters?.category && filters.category !== 'ALL' && prop.category !== filters.category) {
        return false;
      }
      if (filters?.maxPrice && prop.priceInr > filters.maxPrice) {
        return false;
      }
      if (filters?.query?.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matches =
          prop.titleEn.toLowerCase().includes(q) ||
          prop.titleKn.includes(q) ||
          prop.location.localityEn.toLowerCase().includes(q) ||
          prop.location.localityKn.includes(q) ||
          prop.propertyCode.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }

  getPropertyById(id: string): (PropertyListing & { userId: string; rejectionReason?: string }) | undefined {
    return this.data.properties.find((p) => p.id === id);
  }

  getUserProperties(userId: string) {
    return this.data.properties.filter((p) => p.userId === userId);
  }

  getAllPropertiesForAdmin() {
    return this.data.properties;
  }

  addProperty(property: PropertyListing, userId: string) {
    const entry = { ...property, userId };
    this.data.properties.unshift(entry);
    this.data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      propertyId: property.id,
      actorUserId: userId,
      actorName: property.sellerName,
      action: 'SUBMIT',
      reason: 'Submitted listing for moderation.',
      timestamp: new Date().toISOString(),
    });
    this.save();
    return entry;
  }

  updatePropertyStatus(
    propertyId: string,
    status: PropertyListing['status'],
    actor: { id: string; name: string },
    reason?: string
  ): boolean {
    const prop = this.data.properties.find((p) => p.id === propertyId);
    if (!prop) return false;

    prop.status = status;
    prop.updatedAt = new Date().toISOString();
    if (status === 'PUBLISHED') {
      prop.publishedAt = new Date().toISOString();
      prop.rejectionReason = undefined;
    } else if (status === 'REJECTED') {
      prop.rejectionReason = reason;
    }

    this.data.auditLogs.unshift({
      id: `log-${Date.now()}`,
      propertyId,
      actorUserId: actor.id,
      actorName: actor.name,
      action: status === 'PUBLISHED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'PAUSE',
      reason,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return true;
  }

  // --- Leads, Enquiries & Visits ---
  addEnquiry(enquiry: SeekerEnquiry, seekerUserId?: string): SeekerEnquiry {
    const prop = this.getPropertyById(enquiry.propertyId);
    if (!prop) throw new Error('Property not found');

    // Idempotency check: prevent duplicate submission in 1 minute
    const recent = this.data.enquiries.find(
      (e) =>
        e.propertyId === enquiry.propertyId &&
        e.seekerPhone === enquiry.seekerPhone &&
        Date.now() - new Date(e.createdAt).getTime() < 60000
    );
    if (recent) return recent;

    const entry = {
      ...enquiry,
      sellerUserId: prop.userId,
      seekerUserId,
    };
    this.data.enquiries.unshift(entry);
    prop.enquiriesCount = (prop.enquiriesCount || 0) + 1;
    this.save();
    return entry;
  }

  getEnquiriesForSeller(sellerUserId: string) {
    return this.data.enquiries.filter((e) => e.sellerUserId === sellerUserId);
  }

  getEnquiriesForSeeker(seekerUserId: string) {
    return this.data.enquiries.filter((e) => e.seekerUserId === seekerUserId);
  }

  addSiteVisit(visit: SiteVisitRequest, seekerUserId?: string): SiteVisitRequest {
    const prop = this.getPropertyById(visit.propertyId);
    if (!prop) throw new Error('Property not found');

    // Idempotency check: duplicate date and phone within 1 minute
    const recent = this.data.siteVisits.find(
      (v) =>
        v.propertyId === visit.propertyId &&
        v.seekerPhone === visit.seekerPhone &&
        v.preferredDate === visit.preferredDate &&
        Date.now() - new Date(v.createdAt).getTime() < 60000
    );
    if (recent) return recent;

    const entry = {
      ...visit,
      sellerUserId: prop.userId,
      seekerUserId,
    };
    this.data.siteVisits.unshift(entry);
    this.save();
    return entry;
  }

  getSiteVisitsForSeller(sellerUserId: string) {
    return this.data.siteVisits.filter((v) => v.sellerUserId === sellerUserId);
  }

  updateSiteVisitStatus(visitId: string, status: SiteVisitRequest['status'], sellerUserId: string): boolean {
    const visit = this.data.siteVisits.find((v) => v.id === visitId && v.sellerUserId === sellerUserId);
    if (!visit) return false;
    visit.status = status;
    this.save();
    return true;
  }

  // --- Favorites ---
  getUserFavorites(userId: string): string[] {
    return this.data.favorites.filter((f) => f.userId === userId).map((f) => f.propertyId);
  }

  toggleFavorite(userId: string, propertyId: string): { isFavorited: boolean } {
    const idx = this.data.favorites.findIndex((f) => f.userId === userId && f.propertyId === propertyId);
    if (idx >= 0) {
      this.data.favorites.splice(idx, 1);
      this.save();
      return { isFavorited: false };
    } else {
      this.data.favorites.push({ userId, propertyId, createdAt: new Date().toISOString() });
      this.save();
      return { isFavorited: true };
    }
  }

  // --- Audit Logs ---
  getAuditLogs() {
    return this.data.auditLogs;
  }
}

// Global Singleton for the Next.js runtime
declare global {
  var __mandyaDb: MarketplaceDatabase | undefined;
}

export const db = global.__mandyaDb || (global.__mandyaDb = new MarketplaceDatabase());
