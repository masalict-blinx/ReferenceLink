import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get('platform')

  let query = supabase.from('channels').select('id, name, platform, sessions(id, verified_at)')
  if (platform) query = query.eq('platform', platform)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []).map((ch: any) => {
    const sessions = ch.sessions ?? []
    const clicks = sessions.length
    const verified = sessions.filter((s: any) => s.verified_at).length
    return {
      channel_id: ch.id,
      channel_name: ch.name,
      platform: ch.platform,
      clicks,
      verified,
      cvr: clicks > 0 ? Math.round((verified / clicks) * 1000) / 10 : 0,
    }
  })

  return NextResponse.json(rows)
}
