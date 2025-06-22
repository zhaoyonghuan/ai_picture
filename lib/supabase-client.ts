import { createClient } from '@supabase/supabase-js'

// Client for use in browser environments (e.g., components)
export const supabaseBrowserClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client for use in server environments (e.g., API routes)
// Note: This uses the service_role key and should only be used on the server.
export const supabaseAdminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) 