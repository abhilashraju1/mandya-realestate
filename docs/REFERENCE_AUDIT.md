# REFERENCE AUDIT — REAL ESTATE PLATFORMS & REGULATORY STANDARDS
**Project:** Mandya Properties (Mandya Real Estate Marketplace)  
**Date:** 17 November 2026  
**Auditor:** Antigravity Product & Architecture Team  

This document analyzes industry benchmarks across India and globally, extracting battle-tested UX patterns, functional modules, data contracts, and mobile PWA strategies tailored to the Mandya district real estate ecosystem (rural, semi-urban, agricultural, residential sites, and commercial hubs).

---

## 1. Housing.com
* **URL:** `https://housing.com/` & `https://seller.housing.com/user-login`
* **Observed Patterns:**
  * **Visual-First Property Cards:** High aspect-ratio horizontal image carousels with swipe gestures on mobile, upfront per-sqft pricing alongside total asking price, and verified badges.
  * **Segmented Intent Header:** Prominent tabs for Buy / Rent / Commercial / Plots with immediate micro-market locality autocomplete.
  * **3-Step Seller Listing Wizard:** Step-by-step progressive disclosure (Property Details -> Media & Docs -> Pricing & Preview) reducing cognitive overload and abandonment.
  * **SEO & Locality Guides:** Dynamic locality landing pages with average price per sqft trends, nearby landmarks, and commute insights.
* **Adaptations for Mandya Properties:**
  * Adopt the clean visual card aesthetic, sticky filter pills, and 5-step guided wizard for owners and local brokers.
  * Localize locality guides for Mandya's 7 Taluks (Mandya, Maddur, Srirangapatna, Pandavapura, Malavalli, Nagamangala, Krishnarajapete).
  * Feature Mandya-specific site dimensions (30x40, 40x60, 50x80) and Gunta/Acre conversions.
* **Exclusions:**
  * Exclude paid advertisement clutter, sponsored pop-up banners, and high-frequency automated telemarketing calls that overwhelm users.

---

## 2. NoBroker.in
* **URL:** `https://www.nobroker.in/`
* **Observed Patterns:**
  * **Direct Owner Attribution:** Transparent "Owner" vs. "Agent" tag directly on property cards and search filters.
  * **Locality & Radius Browsing:** Multi-locality selection with customizable radius (e.g., 2km, 5km) around landmarks.
  * **Verified Direct Contact:** Quick click-to-call and WhatsApp deep-links with pre-filled property reference codes (`#MND-XXXX`).
* **Adaptations for Mandya Properties:**
  * Explicit owner badges to build high local trust; free direct contact for genuine seekers.
  * Privacy-aware WhatsApp and click-to-call routing with consent and event logging.
  * Support for local landmarks (e.g., Sugar Factory circle, Mysore-Bangalore Expressway service road, DC Office, Railway Station).
* **Exclusions:**
  * Do not implement restrictive paid contact paywalls or pushy auxiliary subscription upsells (such as paid packaging/interiors) in MVP.

---

## 3. 99acres.com
* **URL:** `https://www.99acres.com/`
* **Observed Patterns:**
  * **Attribute Richness & Taxonomy:** Granular categorisation: Independent House, Villa, Farmhouse, Agricultural Land (Dry/Wet/Garden), Commercial Showroom, Industrial Plot.
  * **Zoning & Approval Status:** Clear indicators for planning authority approvals (BDA, MUDA, DTCP, Gram Panchayat e-swathu Form 9/11).
  * **Agent Directory:** Verified broker profiles displaying active inventory, years of local operation, and specialized taluk focus.
* **Adaptations for Mandya Properties:**
  * Comprehensive property taxonomy including Karnataka-specific approvals: MUDA (Mandya Urban Development Authority), DTCP, Gram Panchayat Form 9/11, and RTC / Pahani land records.
  * Agricultural land details: water source (Borewell, Canal/KRS, Well), crop history (Sugarcane, Paddy, Coconut, Arecanut), and road access.
* **Exclusions:**
  * Exclude cluttered 1990s-style desktop layouts and dense broker spam listings. Maintain a modern, uncluttered UI.

---

## 4. Magicbricks.com
* **URL:** `https://www.magicbricks.com/`
* **Observed Patterns:**
  * **Commercial Inventory Detail:** Specialized fields for commercial spaces (carpet vs super built-up, frontage, washrooms, power backup, parking slots, GST applicability).
  * **Q&A & Local Advice:** Locality reviews and community insights.
* **Adaptations for Mandya Properties:**
  * High-clarity commercial property profiles for shops, warehouses, and showrooms along the Bangalore-Mysore Highway corridor and Mandya town market areas.
* **Exclusions:**
  * Eliminate heavy pop-up modals and intrusive lead-capture walls before allowing users to see photos.

---

## 5. Airbnb.com
* **URL:** `https://www.airbnb.com/`
* **Observed Patterns:**
  * **World-Class Mobile UX:** Flawless 44px+ touch targets, edge-to-edge photo galleries, fluid bottom sheet modal drawers, gesture-driven image carousels, and instant tactile feedback.
  * **Frictionless Favorites & Saved State:** Instant heart toggle with optimistic UI updates and local persistence for guests.
  * **Accessible Typography & Whitespace:** High contrast ratio, warm neutrals, and crisp information hierarchy.
* **Adaptations for Mandya Properties:**
  * Primary mobile PWA layout structure: bottom navigation bar (`Home`, `Explore/Search`, `Post Property`, `Saved`, `Account`), bottom sheet filters, and lightweight photo lightbox.

---

## 6. Zillow.com
* **URL:** `https://www.zillow.com/`
* **Observed Patterns:**
  * **Synchronized Map & List View:** Dual-screen toggle on mobile (`List View` vs `Map View`) with interactive pins highlighting price.
  * **Bounding Box Search:** Spatial queries re-fetching visible listings as the user pans or zooms the map.
* **Adaptations for Mandya Properties:**
  * MapLibre GL with OpenStreetMap tiles for geospatial discovery.
  * **Privacy-Preserving Public Pins:** Public pins are intentionally fuzzed/jittered by 150-300m to protect owner privacy and security; exact coordinates are never leaked to unauthenticated users.

---

## 7. Karnataka RERA (K-RERA)
* **URL:** `https://rera.karnataka.gov.in/`
* **Observed Regulatory Requirements:**
  * Projects exceeding 500 sq meters (~5,382 sq ft) or more than 8 apartment units must possess a valid Karnataka RERA Registration Number (`PRM/KA/RERA/...`).
  * Listings referencing RERA approvals must display the official registration number and a link for users to verify credentials on the official K-RERA portal.
  * Consumer protection mandates clear disclaimers that the platform is a marketplace facilitator and does not independently warrant title ownership without verified legal scrutiny.
* **Adaptations for Mandya Properties:**
  * Dedicated RERA registration field with validation pattern matching.
  * Distinct badges: `Phone Verified`, `Agent Identity Verified`, `Documents Reviewed`. Never use misleading badges like `Legally Cleared Title`.

---

## 8. Next.js Progressive Web App (PWA) Standards
* **Reference:** `https://nextjs.org/docs/app/guides/progressive-web-apps`
* **Implementation Strategy:**
  * Web App Manifest (`manifest.webmanifest`) supporting standalone display, theme color `#0F766E`, background `#F5F7F6`, and maskable icons.
  * Serwist / Workbox Service Worker:
    * Stale-while-revalidate for static assets, fonts (Noto Sans Kannada, Inter), and static CMS assets.
    * Network-first with offline fallback page (`/offline`) for dynamic search and listing pages.
    * Strictly bypass cache for authentication tokens, OTP routes, and sensitive document URLs.
  * Install prompt banner (custom bottom drawer) tailored for Android Chrome and iOS Safari.
