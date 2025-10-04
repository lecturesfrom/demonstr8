/**
 * Supabase Server Client
 *
 * What: Server-side connection to Supabase (uses service role key)
 * Why: API routes need elevated permissions to update data
 * How it helps users: Host actions (approve, play, skip) work reliably
 *
 * Technical: Uses service role key (bypasses RLS), only used in API routes (never browser)
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
