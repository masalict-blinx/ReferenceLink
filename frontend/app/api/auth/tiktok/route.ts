import { NextResponse } from 'next/server'

export function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000'
  const params = new URLSearchParams({
    client_key: clientKey ?? '',
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: `${baseUrl}/api/auth/tiktok/callback`,
    state: 'follower_tracker',
  })
  return NextResponse.redirect(`https://www.tiktok.com/v2/auth/authorize/?${params}`)
}
