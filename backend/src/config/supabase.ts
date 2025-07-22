import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import type { Database } from '@/types/database';

// Admin client with service role key - bypasses RLS
export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Public client with anon key - respects RLS
export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);