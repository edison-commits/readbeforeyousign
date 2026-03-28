import { createClient } from '@supabase/supabase-js'

// Browser client for auth operations
export function createAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server client for checking auth in API routes
export function createServerAuthClient(accessToken?: string) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken ? {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    } : undefined
  )
  return client
}
