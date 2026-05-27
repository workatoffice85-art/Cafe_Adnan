import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback values for build-time safety if env variables are not set yet
const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project');

export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);

export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isConfigured) return false;
  try {
    const { error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
};
