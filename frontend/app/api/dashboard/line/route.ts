import { NextResponse } from 'next/server'

const LINE_SUPABASE_URL = process.env.LINE_SUPABASE_URL ?? ''
const LINE_SUPABASE_SERVICE_ROLE_KEY = process.env.LINE_SUPABASE_SERVICE_ROLE_KEY ?? ''

export async function GET() {
  const res = await fetch(`${LINE_SUPABASE_URL}/rest/v1/channel_summary?select=*`, {
    headers: {
      apikey: LINE_SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${LINE_SUPABASE_SERVICE_ROLE_KEY}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch LINE data' }, { status: 502 })

  const data = await res.json()
  return NextResponse.json(
    data.map((r: any) => ({
      channel_id: String(r.id),
      channel_name: r.name,
      source: r.source ?? '',
      short_code: r.short_code ?? '',
      clicks: r.click_count ?? 0,
      verified: r.follow_count ?? 0,
      cvr: parseFloat(r.cvr ?? 0),
    }))
  )
}
