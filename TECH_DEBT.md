# Tech Debt

## 105 TypeScript errors (pre-existing)

Inherited from a "feat: Complete e-commerce platform" commit that
shipped with mixed `address` / `shippingAddress` conventions and
stale Address field references (`street`, `governorate` vs schema's
`line1`, `region`).

Currently unblocked with `typescript.ignoreBuildErrors: true` in
`next.config.js`. Demo path (homepage + admin dashboard) works at
runtime; some deep routes may 500 on undefined fields.

**Fix plan (week 2):**
1. Pick one convention: `address` (majority) — done for imports/includes
2. Reconcile Address model fields across code paths
3. Restore strict type-checking, remove the flag
4. Re-run `pnpm audit --audit-level high` and patch remaining
