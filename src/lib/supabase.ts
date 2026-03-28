import { createClient } from '@supabase/supabase-js'

// Server-side client with service role (bypasses RLS)
// Used in API routes for inserting/reading data on behalf of users
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

// Browser-side client with anon key (respects RLS)
// Used in client components for auth and user-scoped queries
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(supabaseUrl, anonKey)
}
