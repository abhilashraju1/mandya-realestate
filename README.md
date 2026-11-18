# 🏡 Mandya Properties (ಮಂಡ್ಯ ಪ್ರಾಪರ್ಟೀಸ್)
> **Bilingual Mobile-First Real Estate Marketplace PWA for Mandya District, Karnataka**  
> Covers Mandya, Maddur, Srirangapatna, Pandavapura, Malavalli, Nagamangala, and Krishnarajapete.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Run automated tests (12 passing tests)
pnpm exec vitest run

# 3. Build Cloudflare Pages production bundle (out/)
cd apps/web && pnpm run build

# 4. Start local development server (http://localhost:3000)
pnpm run dev
```

---

## 📱 Accessing on Outside Devices (Phones) via Cloudflare Tunnel
```bash
# Start Cloudflare Tunnel to expose local port 3000 over public HTTPS:
/home/5296658037_0/.gemini/antigravity/bin/cloudflared tunnel --url http://localhost:3000
```
Open the generated `https://*.trycloudflare.com` URL on your mobile phone to install the PWA and test all features live!

---

## 📖 Complete Documentation & Verification
For full tech stack details, manual test scripts, and Cloudflare Pages deployment instructions, read:  
👉 **[CLOUDFLARE_SETUP_AND_MANUAL_VERIFICATION_GUIDE.md](./CLOUDFLARE_SETUP_AND_MANUAL_VERIFICATION_GUIDE.md)**
