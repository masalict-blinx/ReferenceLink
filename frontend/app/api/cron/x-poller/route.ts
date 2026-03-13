import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CODE_PATTERN = /\bXP-\d{4}\b/g

export const dynamic = 'force-dynamic'

export async function GET() {
  const bearerToken = process.env.X_BEARER_TOKEN
  const apiKey = process.env.X_API_KEY
  const apiKeySecret = process.env.X_API_KEY_SECRET
  const accessToken = process.env.X_ACCESS_TOKEN
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET

  if (!bearerToken) return NextResponse.json({ ok: false, reason: 'X_BEARER_TOKEN not set' })

  try {
    // 自分のユーザーIDを取得
    const meRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${bearerToken}` },
    })
    if (!meRes.ok) return NextResponse.json({ ok: false, reason: 'Failed to get user' })
    const me = await meRes.json()
    const myId = me.data.id

    // メンションを取得
    const mentionsRes = await fetch(
      `https://api.twitter.com/2/users/${myId}/mentions?max_results=20&tweet.fields=author_id,text`,
      { headers: { Authorization: `Bearer ${bearerToken}` } }
    )
    if (!mentionsRes.ok) return NextResponse.json({ ok: false, reason: 'Failed to get mentions' })
    const mentions = await mentionsRes.json()
    if (!mentions.data?.length) return NextResponse.json({ ok: true, processed: 0 })

    let matched = 0
    for (const tweet of mentions.data) {
      const codes = tweet.text.match(CODE_PATTERN) ?? []
      for (const code of codes) {
        const { data: session } = await supabase
          .from('sessions')
          .select('id, status')
          .eq('code', code)
          .eq('platform', 'x')
          .neq('status', 'FOLLOW_VERIFIED')
          .single()

        if (session) {
          await supabase
            .from('sessions')
            .update({ status: 'FOLLOW_VERIFIED', verified_at: new Date().toISOString(), platform_user_id: String(tweet.author_id) })
            .eq('id', session.id)
          matched++
        }
      }
    }

    return NextResponse.json({ ok: true, processed: mentions.data.length, matched })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
