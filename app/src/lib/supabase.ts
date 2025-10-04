/**
 * Supabase Browser Client
 *
 * What: Client-side connection to Supabase (uses anon key)
 * Why: Pages and components need to query the database
 * How it helps users: Real-time updates work in the browser (fans see queue changes instantly)
 *
 * Technical: Uses anon key (safe for browser), RLS policies protect data
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
