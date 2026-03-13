import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params

  const { data: channel } = await supabase
    .from('channels')
    .select('id')
    .eq('id', channelId)
    .single()

  if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

  const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000'}/track/${channelId}`
  const buffer = await QRCode.toBuffer(url, { type: 'png', width: 300 })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename=qr-${channelId}.png`,
    },
  })
}
