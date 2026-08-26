import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getTenant } from '@/lib/tenant'
import { DomainSettings } from '@/components/admin/domain-settings'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Custom Domain — Admin' }

export default async function DomainAdminPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id as string | undefined
  const tenant = await getTenant()
  if (!tenant || !userId) redirect('/api/auth/signin')

  const member = await db.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId: tenant.id, userId } },
  })
  if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Custom Domain</h1>
        <p className="text-slate-600">Only the store OWNER or an ADMIN can manage the custom domain.</p>
      </div>
    )
  }

  return (
    <DomainSettings
      tenant={{
        slug: tenant.slug,
        customDomain: tenant.customDomain ?? null,
        customDomainVerifiedAt: tenant.customDomainVerifiedAt?.toISOString() ?? null,
      }}
    />
  )
}
