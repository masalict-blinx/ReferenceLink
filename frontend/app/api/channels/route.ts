import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const platform = req.nextUrl.searchParams.get('platform')
  let query = supabase.from('channels').select('*')
  if (platform) query = query.eq('platform', platform)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, platform, name, description } = body

  const { data: existing } = await supabase.from('channels').select('id').eq('id', id).single()
  if (existing) return NextResponse.json({ error: 'Channel ID already exists' }, { status: 400 })

  const { data, error } = await supabase
    .from('channels')
    .insert({ id, platform, name, description })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
