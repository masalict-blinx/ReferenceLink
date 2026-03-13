import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Supabase の型定義
export type Channel = {
  id: string
  platform: string
  name: string
  description: string | null
  created_at: string
}

export type Session = {
  id: string
  platform: string
  channel_id: string
  code: string
  clicked_at: string
  verified_at: string | null
  platform_user_id: string | null
  status: string
}
