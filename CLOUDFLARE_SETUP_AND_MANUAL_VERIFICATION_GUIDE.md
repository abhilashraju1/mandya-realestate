# 🏡 Mandya Properties (ಮಂಡ್ಯ ಪ್ರಾಪರ್ಟೀಸ್)
## Complete Tech Stack, Manual Verification & Cloudflare Deployment Guide

> **Production-Oriented PWA | Bilingual (Kannada / English) • Direct Owner & Broker • Mandya District**  
> Complete documentation covering the project architecture, tech stack breakdown, manual testing scenarios, mobile PWA audit, Cloudflare Pages production deployment, and outside device access via Cloudflare Tunnel.

---

## 📑 Table of Contents
1. [Tech Stack Breakdown & Architecture](#1-tech-stack-breakdown--architecture)
2. [Local Setup & Running the Project](#2-local-setup--running-the-project)
3. [Step-by-Step Manual Verification Guide](#3-step-by-step-manual-verification-guide)
4. [Mobile View & PWA Verification Checklist](#4-mobile-view--pwa-verification-checklist)
5. [Accessing from Outside Mobile Devices via Cloudflare Tunnel](#5-accessing-from-outside-mobile-devices-via-cloudflare-tunnel)
6. [Cloudflare Production Deployment (Pages & R2)](#6-cloudflare-production-deployment-pages--r2)
7. [Automated Test Suite Evidence](#7-automated-test-suite-evidence)

---

## 1. Tech Stack Breakdown & Architecture

The application is engineered as a high-performance, modular **pnpm workspace monorepo** with zero bloat and native Cloudflare edge-first architecture:

```
mandya-realestate/
├── apps/
│   └── web/                                # Next.js 14/16 App Router PWA
│       ├── public/                         # Manifest, sw.js, offline.html, PWA icons
│       ├── src/
│       │   ├── app/                        # App Router Pages & Layouts
│       │   │   ├── page.tsx                # Homepage (Hero, Intent tabs, Taluk chips, Featured)
│       │   │   ├── search/page.tsx         # Live search, Bottom-sheet filter, List/Map toggle
│       │   │   ├── property/[id]/page.tsx  # Dynamic Property Detail View (WhatsApp, Call, Visit)
│       │   │   ├── post/page.tsx           # 5-Step Guided Posting Wizard with live area converter
│       │   │   ├── account/page.tsx        # Owner/Agent Dashboard (My Listings, Enquiries Inbox)
│       │   │   ├── admin/page.tsx          # Admin Moderation Desk (Approve/Reject with feedback)
│       │   │   └── saved/page.tsx          # Bookmarked properties (Offline PWA accessible)
│       │   ├── components/                 # UI Components (Navbar, BottomNav, PropertyCard)
│       │   ├── context/                    # Bilingual LanguageContext (en / kn with persistence)
│       │   └── lib/                        # Mock seed dataset & reactive property-store
│       ├── wrangler.toml                   # Cloudflare Pages & R2 bucket binding configuration
│       └── next.config.mjs                 # Cloudflare Pages Static Export configuration
├── packages/
│   └── shared/                             # Core Domain & Mathematical Utility Package
│       ├── src/
│       │   ├── types.ts                    # Strict TypeScript domain interfaces & enums
│       │   ├── units.ts                    # Gunta, Acre, Sqft, 30x40 dimension converter
│       │   ├── constants.ts                # 7 Mandya Taluks, local amenities, and coordinates
│       │   └── i18n.ts                     # Bilingual dictionary (Kannada & English)
│       └── tests/                          # Vitest Automated Test Suites (Units & E2E)
├── pnpm-workspace.yaml
└── package.json
```

### Layer-by-Layer Technical Rationale:

| Layer | Technology | Architectural Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14/16 App Router** | Hybrid Static Site Generation (SSG) with client hydration. Enables instant page transitions and SEO indexability for public property pages. |
| **Styling** | **Tailwind CSS + shadcn/ui tokens** | Utility-first responsive design system using Mandya-tailored tokens (Primary Teal `#0F766E`, Deep Navy `#142B3B`, Warm Gold `#E7A33E`, Off-White Sand `#F5F7F6`). |
| **Icons** | **Lucide React** | Clean, accessible SVG icons with zero layout shift. |
| **Bilingual Typography** | **Google Noto Sans Kannada + Inter** | Standardized Unicode typography with `1.6` line-height for clean diacritic rendering of Kannada conjunct letters (*ottu*). |
| **PWA & Offline** | **Web App Manifest + Custom Service Worker** | Standalone mobile app display, service worker asset caching, and dedicated `/offline.html` fallback. |
| **Calculations** | **Custom Karnataka Land Units Engine** | Canonical mathematical conversion: `1 Gunta = 1,089 sqft`, `1 Acre = 40 Guntas = 43,560 sqft`, `30x40 = 1,200 sqft`. |
| **Hosting & CDN** | **Cloudflare Pages & Workers** | Serverless edge deployment with global 300+ city CDN distribution, sub-50ms TTFB across Karnataka, and DDOS mitigation. |
| **Object Storage** | **Cloudflare R2** | S3-compatible zero-egress fee object storage for property images and private RTC/Pahani ownership documents. |

---

## 2. Local Setup & Running the Project

### Prerequisites:
- Node.js `v20+` or `v22+`
- `pnpm` (`v9+` or `v12+`)

### Step 1: Install Dependencies
```bash
cd /home/5296658037_0/.gemini/antigravity/scratch/mandya-realestate
pnpm install
```

### Step 2: Run Automated Tests
```bash
pnpm exec vitest run
```
*Expected Output:*
```
Test Files  2 passed (2)
     Tests  12 passed (12)
  Duration  ~400ms
```

### Step 3: Start Local Development Server
```bash
pnpm --filter @mandya-realestate/web dev
```
The app will be live at **`http://localhost:3000`**.

---

## 3. Step-by-Step Manual Verification Guide

Follow these verified test scenarios to evaluate end-to-end functionality:

### 👤 Journey 1: Property Seeker (Guest)
1. **Open Homepage (`/`):**
   * Check bilingual toggle in the top navbar: click **"ಕನ್ನಡ"** → Verify the entire UI switches to Kannada (headings, tabs, prices in Lakhs/Crores, button labels). Click again to switch back to English.
   * Observe the 5 Intent tabs: `All`, `Buy`, `Rent`, `Plots & Land`, `Agricultural Farmland`.
   * Click on any taluk quick chip (e.g., **"Maddur"** or **"Srirangapatna"**) → Verifies routing to filtered search results.
2. **Search & Filter (`/search`):**
   * In search input, type `VV Nagar` or `Sugarcane` or `MND-1001` → Results filter instantly.
   * Tap the **Filter** button → In the bottom-sheet modal, adjust the **Max Budget slider** (e.g., ₹50 Lakh) and select Category **"Plots / Sites"** → Tap "Apply Filters" → Only matching sites appear.
   * Toggle **"List"** vs. **"Map"** view → In Map view, observe the stylized SVG map preview with privacy pins displaying prices (`₹32 Lakh`). Verify the privacy advisory banner: *"Public pins fuzzed by 150-300m radius"*.
3. **Property Detail Page (`/property/prop-1`):**
   * Click on the 30x40 site card → View photo gallery, plot area (`1,200 sq.ft (~1.1 Gunta)`), approach road (`30 ft Tar Road`), and approvals (`MUDA Approved`).
   * Click the **"WhatsApp"** button → Confirms WhatsApp opens with pre-filled message referencing `#MND-1001`.
   * Click **"Request Site Visit"** → Enter name, phone, select preferred date → Click Confirm → See success toast: *"Site visit requested successfully!"*.
4. **Favorites / Shortlist (`/saved`):**
   * Tap the Heart icon on any card → Go to `/saved` via bottom nav → Verify bookmarked property is listed. Tap Heart again to remove it.

---

### 🏡 Journey 2: Property Owner / Broker (Listing Creation)
1. **Start Posting (`/post`):**
   * Tap the **"Post Property"** button (center highlighted button in bottom nav).
2. **Step 1 (Role & Category):**
   * Select `Property Owner` → Select `Sell (ಮಾರಾಟ)` → Select `Plots / Sites (30x40)` → Click **Next**.
3. **Step 2 (Location):**
   * Select Taluk: `MANDYA` → Enter Locality: `Guthalu Colony` → Click **Next**.
4. **Step 3 (Attributes & Pricing):**
   * Select Plot Dimension: `30x40` → Verify calculated area immediately updates to `1200 sq.ft (~1.1 Gunta)`.
   * Enter Asking Price: `2800000` → Observe live currency preview: `₹28 Lakh`. Click **Next**.
5. **Step 4 (Title & Description):**
   * Enter Title: `East Facing 30x40 Site near Guthalu Main Road`.
   * Enter Description: `Clear MUDA A-Khata site with Cauvery water connection and 30ft tar road approach.`. Click **Next**.
6. **Step 5 (Contact & Submit):**
   * Enter Name: `Suresh Gowda` → Enter Phone: `9845099887` → Click **"Submit for Moderation"**.
7. **Success Screen:**
   * See confirmation that the listing was submitted with status `PENDING_APPROVAL`.

---

### 🛡️ Journey 3: Administrator / Moderator Desk (`/admin`)
1. **Open Admin Desk (`/admin`):**
   * Click on the **"Pending Review"** tab → Notice the newly submitted listing from Journey 2 appears in the queue with seller name and masked phone.
2. **Approve Listing:**
   * Click the green **"Approve"** button → Status updates to `PUBLISHED`.
3. **Verification in Search:**
   * Navigate back to `/search` → Search for `Guthalu` → Verify the approved listing is now live in public search results!

---

### 📊 Journey 4: Dashboard & Enquiries Inbox (`/account`)
1. Open `/account` → View **"My Listings"** counter.
2. Switch to **"Received Enquiries"** tab → View buyer enquiries with phone number and message.
3. Switch to **"Site Visit Requests"** tab → View seeker's scheduled date and confirm or reschedule.
4. On any active listing, click **"Mark as Sold"** → Listing status updates to `SOLD_OR_RENTED`.

---

## 4. Mobile View & PWA Verification Checklist

The application was built from the ground up for mobile screens:

* **Tested Viewports:**
  * Small phones: `360px × 640px` (Samsung Galaxy A-series, typical rural Mandya devices)
  * Standard phones: `390px × 844px` (iPhone 12/13/14/15)
  * Large phones: `428px × 926px` (iPhone Pro Max, Redmi Note)
  * Tablets: `768px × 1024px`
* **Ergonomics & Touch Targets:**
  * All buttons, select fields, and inputs meet the **minimum 44px touch height** (`min-height: 44px`).
  * Horizontal filter chips support smooth touch swipe with hidden scrollbars (`.no-scrollbar`).
* **Mobile-First Bottom Navigation:**
  * Fixed bottom bar with 5 destinations.
  * Dynamically hidden on `/property/[id]` to give full screen height to the sticky **"Call Seller / WhatsApp / Schedule Visit"** action bar without overlapping.
* **PWA Capabilities:**
  * **Manifest:** Valid `manifest.webmanifest` with `display: "standalone"`, `#0F766E` theme color, and icons.
  * **Service Worker (`sw.js`):** Caches static assets; serves `/offline.html` when network connection is severed.
  * **Test Offline:** Turn off Wi-Fi/Mobile data → Refresh `/saved` → Saved properties remain accessible.

---

## 5. Accessing from Outside Mobile Devices via Cloudflare Tunnel

To test this application directly on your physical smartphone (iOS or Android) without deploying to production:

### Step 1: Start the Local Web Server
```bash
cd /home/5296658037_0/.gemini/antigravity/scratch/mandya-realestate/apps/web
pnpm run dev
# Running on http://localhost:3000
```

### Step 2: Launch Cloudflare Quick Tunnel
In a new terminal window:
```bash
/home/5296658037_0/.gemini/antigravity/bin/cloudflared tunnel --url http://localhost:3000
```

### Step 3: Open the HTTPS URL on Your Phone
`cloudflared` will print a public secure URL:
```text
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://random-subdomain.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

1. Open `https://random-subdomain.trycloudflare.com` on your phone browser (Chrome or Safari).
2. Tap **"Add to Home Screen"** or **"Install App"** → The app installs as a standalone PWA on your phone!
3. Test WhatsApp deep-linking, bilingual Kannada toggle, and search directly on mobile.

---

## 6. Cloudflare Production Deployment (Pages & R2)

The project is pre-configured with `apps/web/wrangler.toml` and Next.js static export (`output: 'export'`).

### Production Build Command:
```bash
cd /home/5296658037_0/.gemini/antigravity/scratch/mandya-realestate/apps/web
pnpm run build
```
This generates the optimized production bundle inside `apps/web/out/`.

### Deploying to Cloudflare Pages:
```bash
# Authenticate with Cloudflare (once):
pnpm exec wrangler login

# Deploy the output directory:
pnpm exec wrangler pages deploy out --project-name=mandya-properties
```

### Cloudflare R2 Bucket Setup (for Media & Documents):
```bash
# Create production & preview R2 buckets:
pnpm exec wrangler r2 bucket create mandya-properties-media
pnpm exec wrangler r2 bucket create mandya-properties-media-preview
```

---

## 7. Automated Test Suite Evidence

Both unit tests and end-to-end workflow verification tests run via Vitest:

```bash
pnpm exec vitest run
```

```text
 ✓ packages/shared/tests/units.test.ts (6 tests)
   ✓ correctly validates 1 Gunta equals 1,089 sqft
   ✓ correctly validates 1 Acre equals 40 Guntas (43,560 sqft)
   ✓ correctly converts standard Karnataka site dimensions (30x40, 40x60, 50x80)
   ✓ correctly formats Indian currency in Lakhs and Crores (₹32 Lakh, ₹1.85 Cr)
   ✓ correctly formats display areas for agricultural and residential properties
   ✓ returns valid bilingual translations (English & Kannada)

 ✓ packages/shared/tests/e2e-seed-verification.test.ts (6 tests)
   ✓ 1. Seed Integrity: Contains valid Mandya taluks and locations
   ✓ 2. Search Filtering: Filters by taluk, category, and budget correctly
   ✓ 3. Land Calculations: Validates plot dimensions and gunta/acre conversions
   ✓ 4. Seeker Enquiry & Site Visit Request Workflow
   ✓ 5. Admin Moderation Transitions: Draft -> Pending -> Published / Rejected
   ✓ 6. Bilingual Localization Consistency

 Test Files  2 passed (2)
      Tests  12 passed (12)
   Duration  393ms
```
