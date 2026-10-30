// ==============================================================================
// VIBHILLION ADMIN: SUPABASE CLIENT CONFIGURATION
// File: apps/admin/src/lib/supabase.ts
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('example.com') &&
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseAnonKey.includes('your-anon-key');

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

