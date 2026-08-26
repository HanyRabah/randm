# Storely → SaaS Plan

Findings from a full audit of the codebase + staging. Grouped by urgency, not by area, so you can work top-down.

---

## P0 — Bugs that break the current demo

Fix these before showing the platform to anyone.

1. **Checkout POST is broken** — [src/app/api/orders/route.ts](src/app/api/orders/route.ts) writes `customerName`, `customerEmail`, `customerPhone`, `address` (string), `discount`. Real schema has `addressId` (required FK), `contactPhone`, `discountAmount`. Every order attempt 500s.
2. **Admin login accepts any password** for hardcoded `admin@furniturestore.com` ([src/lib/auth.ts](src/lib/auth.ts)). Dev shortcut left in. Must be gated behind `NODE_ENV !== 'production'` or removed.
3. **Customer auth references `User.password`** which isn't on the current `schema.prisma`. Silenced by `ignoreBuildErrors`. Sign-in / sign-up will throw.
4. **Wishlist regression** — [src/app/api/wishlist/route.ts](src/app/api/wishlist/route.ts) dropped guest support; unauthenticated wishlist now 404s instead of using a session cart.
5. **Schema drift** — `schema.prisma` has unstaged renames (`name`→`title`, `price`→`basePrice`, new `status` enum). Either commit + migrate, or revert. Right now prod DB and working-tree code disagree.
6. **`next.config.js` swallows TS + ESLint errors.** Turn off `ignoreBuildErrors` after fixing #1–4. Those flags let broken routes ship silently.
7. **105 pre-existing TS errors** from mixed `address` / `shippingAddress` conventions ([TECH_DEBT.md](TECH_DEBT.md)). Pick one convention (`address`), reconcile `Address` field names (schema uses `line1`, `state` — not `street`, `region`/`governorate`).

---

## P1 — Gaps in the single-tenant product itself

Even without going SaaS, these are missing/weak for a paying merchant:

1. **Real auth for customers** — decide: email OTP (matches README claim), magic link, or password. Wire it into NextAuth properly with PrismaAdapter (currently commented out).
2. **Payment gateway abstraction** — even if COD stays the default for MENA, ship at least one online option (Stripe or Paymob). Add a `PaymentMethod` enum on `Order`, a `payments` table, a provider-agnostic interface.
3. **Users admin page** — untracked at [src/app/admin/users/](src/app/admin/users/), unfinished. Commit or drop.
4. **Product edit page** — mid-rewrite, unstaged (+812 lines). Finish and commit.
5. **Localization** — homepage copy is hardcoded English while `SeoSettings` defaults to `ar` + Africa/Cairo. Pick one, or add real i18n (`next-intl`).
6. **Email delivery** — newsletter welcome email is a TODO ([src/app/api/newsletter/subscribe/route.ts:72](src/app/api/newsletter/subscribe/route.ts:72)); no order-confirmation email pipeline visible. Wire Resend or SES.
7. **No middleware.ts** — needed even for single-tenant to do auth gating, rate-limit propagation, and to prepare for SaaS routing.

---

## P2 — SaaS conversion (the big lift)

Nothing multi-tenant exists today. This is the ordered path:

### 2.1 Data model
- ✅ Add `Tenant` (id, slug, plan, status, customDomain, trialEndsAt, createdAt).
- ✅ Add `TenantMember` (tenantId, userId, role: OWNER/ADMIN/STAFF).
- ✅ `getTenant()` helper resolves per-request from Host or `x-tenant-slug`.
- ✅ Nullable `tenantId` added to root business models: `Category`, `Product`, `Cart`, `Order`, `Coupon`, `Popup`, `NewsletterSubscriber`, `NewsletterCampaign`, `Review`, `Wishlist`, `Customer`, `SupportTicket`, `InventoryAlert`, `SeoSettings` (unique).
- ✅ Prisma client extension in `src/lib/db.ts` auto-scopes every query on tenant models — no route-by-route wiring needed. `findMany/findFirst/count/aggregate/groupBy/updateMany/deleteMany` inject `where.tenantId`; `create/createMany/upsert.create` inject `data.tenantId`. `findUnique/update/delete` on `id` stay unscoped (ids are globally unique cuids).
- ✅ `scripts/backfill-tenant.ts` (via `pnpm backfill:tenant`) assigns the default tenant to legacy `null` rows. Idempotent.
- Next: after backfill runs on staging + prod, flip `tenantId` to NOT NULL and swap single-column `@unique` (Product.slug, Coupon.code, Customer.email, NewsletterSubscriber.email) to composite `(tenantId, x)` so a real second tenant can't hit slug collisions.

### 2.2 Tenant resolution
- Add [src/middleware.ts](src/middleware.ts) that reads `Host` header:
  - `<slug>.storely.app` → resolve tenant by slug
  - custom domain → resolve tenant by `customDomain`
  - `storely.app` / `www.storely.app` → marketing site
- Stash `tenantId` on request via header (`x-tenant-id`) that server components / route handlers read.
- Every Prisma query in `src/app/api/**` and `src/server/**` gets scoped by that id. Best done via a `prismaForTenant(tenantId)` extension so you can't forget.

### 2.3 Onboarding flow
- `/signup` → create User + Tenant + TenantMember(OWNER) + default categories/SeoSettings.
- Subdomain picker with availability check.
- Optional: seed sample products from a template.

### 2.4 Billing
- Stripe Billing. Plans: Free (trial), Starter, Pro, Scale.
- `Plan` + `Subscription` models. Webhook handler at `/api/webhooks/stripe`.
- Entitlements table (products cap, orders/month, custom domain y/n, popups y/n).
- Gate features server-side; grey out in UI.

### 2.5 Per-tenant storage & theme
- S3 key prefix `tenants/<id>/…`.
- Move `SeoSettings` fields (brand name, currency, locale, timezone, logo, primary color) to `Tenant` so every store rebrands trivially.

### 2.6 Custom domains
- Vercel Domains API (add/verify) — one call at plan upgrade.
- Store `customDomain` + `customDomainVerifiedAt` on `Tenant`.

---

## P3 — Marketing / sales surface (the "sell it online" part)

You need three new public pages on the apex `storely.app` (separate route group from the storefront):

1. **Landing** (`/`) — hero, "what is Rana", 3 feature blocks (COD-ready, mobile-first admin, no-code storefront), social proof placeholder, CTA to `/signup`.
2. **Pricing** (`/pricing`) — plan cards (Free / Starter / Pro / Scale), feature matrix, FAQ, CTA per card.
3. **Product / features tour** (`/features`) — screenshots of admin + storefront, walkthroughs (products, orders, coupons, popups, COD collection).

Optional: `/docs` (setup guide), `/contact` for enterprise / setup help.

Route structure: add `src/app/(marketing)/` group, keep `(site)` for tenant storefronts, keep `admin` for tenant admin. Middleware decides which group serves each host.

For the "help them set it up" offer — a `/setup-service` page with a paid onboarding tier (Stripe one-time price). Same page, different CTA.

---

## Suggested order of work

1. Fix P0 #1–4 (checkout, admin auth, wishlist, schema drift) — 1–2 days.
2. Turn TS/ESLint back on and clean the 105 errors — 1 day.
3. Ship marketing site (landing + pricing + features) on a new route group behind a feature flag — 2–3 days. **Gives you something to link out for feedback while the SaaS build proceeds.**
4. Multi-tenant schema migration + middleware + tenant scoping — 1–2 weeks.
5. Signup + onboarding — 3–4 days.
6. Stripe Billing + entitlements — 3–5 days.
7. Custom domains + per-tenant theming — 3–4 days.

---

## What I'd start with today

Fix the checkout bug and the admin-auth backdoor first — they're small, and everything else is undemonstrable until they're gone. Then the marketing pages, because those are the thing you actually need to *show people* to gauge demand before spending weeks on multi-tenancy.
