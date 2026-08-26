// Thin wrapper around Vercel's Project Domains API.
// Docs: https://vercel.com/docs/rest-api/reference/endpoints/projects/add-a-domain-to-a-project
//
// Required env:
//   VERCEL_API_TOKEN   — personal or team access token with scope for the project
//   VERCEL_PROJECT_ID  — the project the domains attach to
//   VERCEL_TEAM_ID     — team ID (required for team-scoped projects)

const API = 'https://api.vercel.com'

type VercelDomain = {
  name: string
  verified: boolean
  verification?: Array<{ type: string; domain: string; value: string; reason?: string }>
}

function config() {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID
  if (!token || !projectId) {
    throw new Error(
      'Vercel API not configured: set VERCEL_API_TOKEN and VERCEL_PROJECT_ID (and VERCEL_TEAM_ID if the project is on a team).',
    )
  }
  return { token, projectId, teamId }
}

function url(path: string, teamId?: string) {
  return `${API}${path}${teamId ? `?teamId=${encodeURIComponent(teamId)}` : ''}`
}

async function call(path: string, init: RequestInit & { teamId?: string } = {}) {
  const { token, teamId: cfgTeam } = config()
  const teamId = init.teamId ?? cfgTeam
  const res = await fetch(url(path, teamId), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = body?.error?.message || `Vercel API ${res.status}`
    throw new Error(msg)
  }
  return body
}

export async function addDomain(domain: string): Promise<VercelDomain> {
  const { projectId } = config()
  return call(`/v10/projects/${encodeURIComponent(projectId)}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  })
}

export async function getDomain(domain: string): Promise<VercelDomain> {
  const { projectId } = config()
  return call(`/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}`)
}

export async function removeDomain(domain: string): Promise<void> {
  const { projectId } = config()
  await call(
    `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}`,
    { method: 'DELETE' },
  )
}
