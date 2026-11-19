# 🏡 Mandya Properties (ಮಂಡ್ಯ ಪ್ರಾಪರ್ಟೀಸ್)
> **Bilingual Mobile-First Real Estate Marketplace PWA for Mandya District, Karnataka**  
> Covers Mandya, Maddur, Srirangapatna, Pandavapura, Malavalli, Nagamangala, and Krishnarajapete.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Run automated test suite (21 passing tests)
pnpm test

# 3. Typecheck codebase
pnpm typecheck

# 4. Build full-stack production bundle
pnpm build

# 5. Run 19-step portable live E2E HTTP smoke test suite
python3 e2e-smoke-test.py

# 6. Start local production server (http://localhost:3000)
pnpm --filter @mandya-realestate/web start -p 3000
```

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 14.2 (App Router with full-stack dynamic SSR and REST API `/api/v1/*`)
- **Database & Persistence**: PostgreSQL (Zero-config persistent embedded Postgres via `@electric-sql/pglite` and external PostgreSQL via `pg.Pool` with `DATABASE_URL`)
- **Migrations**: Versioned transactional SQL schema migrations (`schema_migrations`, `users`, `sessions`, `otp_records`, `properties`, `enquiries`, `site_visits`, `favorites`, `moderation_audit_logs`)
- **Authentication**: Mobile OTP verification with phone normalization (`+91`), 60s cooldown, 5-minute expiry, brute-force lockout (>5 failed attempts), and cryptographically secure revocable session tokens with HTTP-only cookies
- **Security & Privacy**: Public allowlist data transformers (`toPublicProperty`), fuzzed approximate GPS pins, stripped private survey numbers, and server-side RBAC
- **Dynamic SEO & Discovery**: Initial SSR HTML containing property title/price/location, dynamic `/sitemap.xml`, and real HTTP 404 for unavailable/unapproved properties
- **Localization & Units**: Kannada (`kn`) and English (`en`) dictionaries with verified Karnataka land conversions (1 Gunta = 1,089 sqft, 1 Acre = 40 Guntas = 43,560 sqft, 30x40, 40x60, Lakhs, Crores)
- **PWA**: Web App Manifest (`manifest.webmanifest`), Service Worker (`sw.js`), and offline fallback (`offline.html`)

---

## 📱 Accessing on Outside Devices (Phones) via Cloudflare Tunnel

```bash
# Terminal 1: Start Next.js production server
pnpm --filter @mandya-realestate/web start -p 3000

# Terminal 2: Expose local port 3000 over secure Cloudflare HTTPS URL
/home/5296658037_0/.gemini/antigravity/bin/cloudflared tunnel --url http://localhost:3000
```

Open the generated `https://*.trycloudflare.com` URL on any mobile phone to test and install the PWA.

---

## 📖 Complete Documentation & Reports
- 👉 **[MANDYA_REMEDIATION_REPORT.md](./docs/MANDYA_REMEDIATION_REPORT.md)**: Full verification matrix, baseline checkpoint evidence, and acceptance criteria.
- 👉 **[CLOUDFLARE_SETUP_AND_MANUAL_VERIFICATION_GUIDE.md](./CLOUDFLARE_SETUP_AND_MANUAL_VERIFICATION_GUIDE.md)**: Cloudflare setup and manual step-by-step verification guide.
- 👉 **[ANTIGRAVITY_MASTER_PROMPTS_AND_PROJECT_RUN_GUIDE.md](./ANTIGRAVITY_MASTER_PROMPTS_AND_PROJECT_RUN_GUIDE.md)**: Implementation stages, prompts, and run instructions.
