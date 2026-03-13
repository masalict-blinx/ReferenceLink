import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generateCode(platform: string): string {
  const prefix: Record<string, string> = { tiktok: 'TK', instagram: 'IG', x: 'XP' }
  const p = prefix[platform] ?? 'XX'
  const num = Math.floor(Math.random() * 9000 + 1000).toString()
  return `${p}-${num}`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params

  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .eq('id', channelId)
    .single()

  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  // 重複しないコード生成
  let code = ''
  for (let i = 0; i < 10; i++) {
    const candidate = generateCode(channel.platform)
    const { data: existing } = await supabase
      .from('sessions')
      .select('id')
      .eq('code', candidate)
      .single()
    if (!existing) { code = candidate; break }
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({ platform: channel.platform, channel_id: channelId, code, status: 'CLICKED' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    session_id: session.id,
    code: session.code,
    platform: channel.platform,
    channel: channel.name,
  })
}
