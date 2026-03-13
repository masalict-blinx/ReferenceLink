import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CODE_PATTERN = /\bTK-\d{4}\b/g

export const dynamic = 'force-dynamic'

export async function GET() {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN
  const videoId = process.env.TIKTOK_PINNED_VIDEO_ID

  if (!accessToken || !videoId) {
    return NextResponse.json({ ok: false, reason: 'TIKTOK_ACCESS_TOKEN or TIKTOK_PINNED_VIDEO_ID not set' })
  }

  try {
    const res = await fetch(
      'https://open.tiktokapis.com/v2/video/comment/list/?fields=id,text,create_time',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_id: videoId, max_count: 50 }),
      }
    )

    if (!res.ok) return NextResponse.json({ ok: false, reason: `TikTok API error: ${res.status}` })

    const data = await res.json()
    const comments = data?.data?.comments ?? []
    if (!comments.length) return NextResponse.json({ ok: true, processed: 0 })

    let matched = 0
    for (const comment of comments) {
      const codes = (comment.text ?? '').match(CODE_PATTERN) ?? []
      for (const code of codes) {
        const { data: session } = await supabase
          .from('sessions')
          .select('id')
          .eq('code', code)
          .eq('platform', 'tiktok')
          .neq('status', 'FOLLOW_VERIFIED')
          .single()

        if (session) {
          await supabase
            .from('sessions')
            .update({ status: 'FOLLOW_VERIFIED', verified_at: new Date().toISOString(), platform_user_id: String(comment.id) })
            .eq('id', session.id)
          matched++
        }
      }
    }

    return NextResponse.json({ ok: true, processed: comments.length, matched })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
