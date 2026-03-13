import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  )
}

// alias
export const supabase = {
  from: (...args: Parameters<ReturnType<typeof getSupabase>['from']>) => getSupabase().from(...args),
  rpc: (...args: Parameters<ReturnType<typeof getSupabase>['rpc']>) => getSupabase().rpc(...args),
}

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
