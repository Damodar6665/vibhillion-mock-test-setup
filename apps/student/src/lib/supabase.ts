import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('example.com') &&
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseAnonKey.includes('your-anon-key');

const serverSafeStorage = {
  getItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      return AsyncStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      return AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      return AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: serverSafeStorage,
      autoRefreshToken: typeof window !== 'undefined',
      persistSession: typeof window !== 'undefined',
      detectSessionInUrl: false,
    },
  }
);
