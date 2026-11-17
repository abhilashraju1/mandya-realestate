# STAGE 0 AUDIT & GAP ANALYSIS — MANDYA PROPERTIES
**Project:** Mandya Properties (Mandya Real Estate Marketplace PWA)  
**Date:** 17 November 2026  
**Status:** Approved for Implementation Planning  

---

## 1. Repository Audit
* **Target Git Repository:** `https://github.com/abhilashraju1/mandya-realestate.git`
* **Local Workspace Directory:** `/home/5296658037_0/.gemini/antigravity/scratch/mandya-realestate`
* **Repository State:** 
  * The local Git repository is initialized with remote `origin` pointing to `https://github.com/abhilashraju1/mandya-realestate.git`.
  * Remote repository on GitHub currently returns HTTP 404 (private / unpushed state), meaning it is cleanly provisioned and ready for initial scaffolding and commits.
  * No legacy code or conflicting commits exist in the repository.
* **Environment Assessment:**
  * Node.js: `v22.12.0` (LTS)
  * pnpm: `v12.21.0` (Turborepo / pnpm workspace compatible)
  * npm: `v10.9.0`
  * Python: `3.13.15`
  * SQLite3: `3.50.4`
  * System Architecture: Linux x86_64 with local outbound proxy configuration.

---

## 2. Requirements Traceability Matrix (PRD v1.0)

| PRD Section | Requirement Description | Implementation Approach | Priority |
| :--- | :--- | :--- | :--- |
| **Sec 1 & 2** | Bilingual Mandya Real Estate Marketplace (Free browsing, admin moderation) | Next.js 16 App Router + Full TypeScript + Modular API with RBAC | P0 (MVP) |
| **Sec 3** | Geographic Hierarchy (Mandya + 7 Taluks: Maddur, Srirangapatna, Pandavapura, Malavalli, Nagamangala, K.R. Pete) | Relational hierarchical location schema with Kannada/English names & aliases | P0 (MVP) |
| **Sec 3** | Bilingual UI & Content (English & Kannada toggle with persistence) | `next-intl` or lightweight custom JSON dictionary, Noto Sans Kannada font | P0 (MVP) |
| **Sec 4 & 5** | Mobile-First UI/UX System & Public PWA screens | Bottom nav (Home, Explore, Post, Saved, Profile), Tailwind CSS, shadcn/ui tokens | P0 (MVP) |
| **Sec 6** | Structured Property Attributes & Local Unit Conversions (sqft, sqm, gunta, acre, 30x40, 40x60) | Strict Zod validation schemas & mathematical unit converter utility with unit tests | P0 (MVP) |
| **Sec 7** | Search, Filters & Privacy-aware Geospatial Mapping | URL-encoded search state, PostGIS/spatial bounds, MapLibre GL with fuzzed coordinates | P0 (MVP) |
| **Sec 8** | Guided 5-Step Listing Creation Wizard | Stepper form (Category -> Location -> Details/Pricing -> Media/Docs -> Submit) | P0 (MVP) |
| **Sec 8** | Owner & Agent Dashboards | Manage listings, track enquiries, schedule visits, mark as Sold/Rented | P0 (MVP) |
| **Sec 9** | Authentication & Role-Based Access Control (RBAC) | Secure Phone OTP adapter (mock in dev), session/JWT tokens, role guards | P0 (MVP) |
| **Sec 10** | Technical Stack & Modular Monolith Architecture | pnpm monorepo: `apps/web` (Next.js 16 PWA), `apps/api` (REST API), `packages/*` | P0 (MVP) |
| **Sec 11** | Database Schema & OpenAPI Contract | Normalized relational schema (PostgreSQL/SQLite compatible), OpenAPI 3.0 spec | P0 (MVP) |
| **Sec 12** | Local Demo Seed Dataset (15-20 realistic Mandya listings across taluks) | Seed scripts with high-quality localized mock data and explicit `[DEMO]` badges | P0 (MVP) |
| **Sec 13** | Installable PWA with Offline Support | Web App Manifest, Service Worker caching, and `/offline` fallback page | P0 (MVP) |
| **Sec 14** | Enquiries, WhatsApp Deep Linking & Contact Logging | Property ID pre-filled WhatsApp links, site visit requests, contact event tracking | P0 (MVP) |
| **Sec 15** | Testing & Quality Gates (Unit, Integration, E2E, Lighthouse targets) | Vitest, Playwright, accessibility checks, responsive audit (320px to 1440px) | P0 (MVP) |
| **Sec 16** | Future Monetization & Advanced Features | Feature-flagged billing, promoted slots, property comparison (Phase 2) | P1 (Phase 2) |

---

## 3. Scope & Gap Analysis

1. **Backend Runtime Alignment (Laravel vs Node/TypeScript Engine):**
   * *PRD Mention:* The PRD lists Laravel/PHP as a recommended option, but also specifies modular monolith and strict TypeScript contracts.
   * *Local Environment Reality:* The sandbox environment provides Node.js v22 and pnpm, while PHP/Composer is not installed in the standard container.
   * *Resolution (ADR-001):* Implement the full-stack architecture using a high-performance **TypeScript Modular Architecture** (Next.js 16 App Router for Web/PWA + Next.js Server / Express/Fastify API routes with Prisma ORM and PostgreSQL/SQLite adapter). This delivers 100% type safety, shared validation packages across frontend and backend, instant local execution, and rapid Dockerization without runtime mismatch.
2. **Geographic Precision & Privacy Gaps:**
   * Mandya has significant rural and agricultural land where survey numbers (RTC/Pahani) are sensitive legal documents.
   * *Resolution:* Store exact geo-coordinates and legal survey numbers in private tables accessible only by authenticated admins/moderators; expose only fuzzed radius centroids (150-300m jitter) on public maps.
3. **Connectivity Constraints (Tier-3 PWA):**
   * Mobile data in rural Mandya villages (e.g., in interior Malavalli or K.R. Pete) can be intermittent.
   * *Resolution:* Ensure core property cards, saved favorites, and contact info are cached locally in IndexedDB / CacheStorage via the PWA service worker so users never see broken screens.

---

## 4. Risk Log & Mitigation Strategy

| Risk ID | Description | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **RSK-01** | Fraudulent listings or fake title ownership claims | High | Mandatory moderation workflow; strict disclaimer that platform does not certify legal titles; dedicated "Report Listing" button. |
| **RSK-02** | Telemarketing spam and broker harassment for seekers | High | Direct owner tagging; seeker contact details are never exposed publicly; seeker initiates contact via WhatsApp or in-app enquiry. |
| **RSK-03** | Kannada font rendering and transliteration inconsistencies | Medium | Use Google Noto Sans Kannada; maintain standardized bilingual dictionary for all 7 taluks, property types, and amenities. |
| **RSK-04** | Complex land unit confusion (Cents vs Guntas vs Acres vs Sqft) | Medium | Automatic bi-directional calculator during posting and search; canonical storage in square feet with formatted display in user's preferred unit. |
