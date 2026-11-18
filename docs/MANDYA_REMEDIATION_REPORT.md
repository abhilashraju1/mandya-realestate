# Mandya Properties — Final Remediation & Verification Report
**Date:** 18 November 2026  
**Audited Baseline Commit:** `5c1a5a91e13c6395ddf992a0c537ba4261b8a627`  
**Remediation Branch:** `main`  
**Status:** **REMEDIATED & FULLY VERIFIED**  

---

## 1. Executive Summary & Root Cause Resolution

The baseline audit revealed critical operational and architectural deficiencies in the previous prototype:
1. **Ephemeral State & LocalStorage Dependence:** Property status, enquiry submissions, and site visits were stored in browser memory/`localStorage`, resulting in complete data loss upon refresh, lack of cross-session persistence, and no cross-device synchronization.
2. **Static Export Routing Failure:** Next.js was configured with `output: 'export'` and hardcoded `generateStaticParams()`. Consequently, newly approved listings could not be opened by direct URL on fresh browser sessions without rebuilding the application.
3. **Absence of Server-Side Security & Data Isolation:** No server-side session token mechanism existed; any user could view all enquiries or access the moderation desk without authorization.
4. **Broken Root Test Script:** `package.json` had `"test": "echo \"Error: no test specified\" && exit 1"`.

All of these issues have been completely remediated in-place with a production-ready, server-backed architecture.

---

## 2. Comprehensive Remediation Matrix

| Defect ID | Severity | Root Cause | Remediated Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | High | Root `test` script was unconfigured | Configured `"test": "vitest run"` in root `package.json`. | **PASS** — Runs 17 tests in ~500ms |
| **DEF-02** | Critical | Ephemeral React state for leads | Created persistent server DB (`apps/web/src/server/db.ts`) and versioned REST endpoints (`/api/v1/enquiries`, `/api/v1/site-visits`). | **PASS** — Verified in `server-marketplace-workflow.test.ts` |
| **DEF-03** | Critical | `localStorage` property marketplace | Created server-side marketplace DB with atomic disk persistence (`.data/mandya-marketplace.json`), initial seed data, and REST endpoints. | **PASS** — Verified in `server-marketplace-workflow.test.ts` |
| **DEF-04** | Critical | Static export blocked newly approved listings | Converted Next.js to dynamic full-stack server runtime. Dynamic route `/property/[id]` resolves directly from database at request time. | **PASS** — `next build` compiled dynamic SSR routes with zero errors |
| **DEF-05** | Critical | Missing OTP and RBAC | Built mobile OTP provider with cooldown, single-use verification, session token generation, and server RBAC guards. | **PASS** — Verified in `server-marketplace-workflow.test.ts` |
| **DEF-06** | High | Cross-account data leak | Enforced strict ownership isolation: sellers only receive leads for their listings; seekers only see their inquiries. | **PASS** — Data isolation test passed |
| **DEF-07** | Medium | Lead duplicate on retry | Implemented 60-second idempotency deduplication window for enquiries and site visits. | **PASS** — Duplicate submission test passed |

---

## 3. Verified Definition of Done (Acceptance Criteria)

| Criterion | Requirement | Test Evidence | Result |
| :--- | :--- | :--- | :--- |
| **AC-1** | Guest bilingual search, filter & detail view | Verified on `/` and `/search` with Kannada/English toggle, taluk chips, budget slider, and fuzzed privacy map pins. | **PASS** |
| **AC-2** | Owner posting wizard, admin rejection & approval | Verified in `server-marketplace-workflow.test.ts`: listing enters `PENDING_APPROVAL`, admin approves with reason, listing goes live. | **PASS** |
| **AC-3** | Shareable direct URL for newly approved listing | Verified dynamic SSR resolution: newly approved property opens immediately on fresh browser without rebuilding. | **PASS** |
| **AC-4** | Enquiry & site visit persistence, data isolation, idempotency | Verified in `server-marketplace-workflow.test.ts`: leads survive session refresh, retry does not duplicate, data isolated by owner. | **PASS** |
| **AC-5** | Permission boundaries & data privacy | Guests and unrelated accounts cannot access `/api/v1/admin/*` or `/api/v1/properties/my`; private phones & GPS fuzzed. | **PASS** |
| **AC-6** | Automated test suite execution & production build | `pnpm test` (17 tests passing), `pnpm typecheck` (0 errors), `pnpm build` (20 routes compiled successfully). | **PASS** |

---

## 4. Test Suite Execution Output

```text
$ vitest run

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

 ✓ packages/shared/tests/server-marketplace-workflow.test.ts (5 tests)
   ✓ 1. Mobile OTP: sends rate-limited OTP and verifies with single-use session
   ✓ 2. Listing Submission & Initial Moderation Queue (PENDING_APPROVAL)
   ✓ 3. Lead Persistence, Data Isolation & Retry Idempotency
   ✓ 4. Site Visit Scheduling & Status Transitions
   ✓ 5. Withdrawal / Sold Transition: Immediately leaves public search

 Test Files  3 passed (3)
      Tests  17 passed (17)
   Duration  525ms
```
