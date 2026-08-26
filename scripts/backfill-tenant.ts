// Assigns the default tenant to every legacy row that has tenantId = null.
// Run once after `pnpm prisma db push` (or migrate deploy) picks up the
// tenantId columns. Idempotent — safe to re-run.
//
//   pnpm tsx scripts/backfill-tenant.ts
//
// ponytail: uses the un-extended base PrismaClient directly so the
// tenant-scoping query hook doesn't hide the null rows we're trying to
// update. Also lets this run outside a request context.

import { PrismaClient } from '@prisma/client'

const base = new PrismaClient()

const TABLES = [
  'Product',
  'Category',
  'Cart',
  'Order',
  'Coupon',
  'Popup',
  'NewsletterSubscriber',
  'NewsletterCampaign',
  'Review',
  'Wishlist',
  'Customer',
  'SupportTicket',
  'InventoryAlert',
  'SeoSettings',
] as const

async function main() {
  const tenant =
    (await base.tenant.findUnique({ where: { slug: 'default' } })) ??
    (await base.tenant.create({ data: { slug: 'default', name: 'Default Store' } }))

  console.log(`Backfilling to default tenant ${tenant.id} (${tenant.slug})`)

  for (const table of TABLES) {
    // Raw SQL is required — Prisma's updateMany accepts model names, not
    // table names, but the model→table map is 1:1 here.
    const result = await base.$executeRawUnsafe(
      `UPDATE "${table}" SET "tenantId" = $1 WHERE "tenantId" IS NULL`,
      tenant.id,
    )
    console.log(`  ${table.padEnd(24)} → ${result} rows`)
  }

  console.log('Done.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => base.$disconnect())
