import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') ?? ''
  const error = req.nextUrl.searchParams.get('error') ?? ''
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000'

  if (error) return new NextResponse(`<p>エラー: ${error}</p>`, { headers: { 'Content-Type': 'text/html' } })
  if (!code) return new NextResponse('<p>codeが取得できませんでした</p>', { headers: { 'Content-Type': 'text/html' } })

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY ?? '',
      client_secret: process.env.TIKTOK_CLIENT_SECRET ?? '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${baseUrl}/api/auth/tiktok/callback`,
    }),
  })

  if (!res.ok) return new NextResponse(`<p>トークン取得失敗: ${await res.text()}</p>`, { headers: { 'Content-Type': 'text/html' } })

  const data = (await res.json()).data ?? {}
  const html = `<html><body style="font-family:sans-serif;padding:40px">
  <h2>TikTok 認証成功</h2>
  <p>以下の値をVercelの環境変数に設定してください：</p>
  <table border="1" cellpadding="8">
    <tr><th>変数名</th><th>値</th></tr>
    <tr><td>TIKTOK_ACCESS_TOKEN</td><td><code>${data.access_token ?? ''}</code></td></tr>
    <tr><td>TIKTOK_OPEN_ID</td><td><code>${data.open_id ?? ''}</code></td></tr>
  </table>
  <p style="color:#888">refresh_token: ${data.refresh_token ?? ''}</p>
  </body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}
