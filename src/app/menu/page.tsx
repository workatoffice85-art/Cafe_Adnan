import MenuClient from './MenuClient';
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'القائمة | Cafe Adnan',
  description: 'استعرض قائمة قهوة عدنان — أجود أنواع القهوة والمشروبات والحلويات',
};

// Enable Incremental Static Regeneration (ISR) to cache page at Edge CDN
// and automatically regenerate in background every 10 seconds.
export const revalidate = 10;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function MenuPage() {
  let initialCategories: any[] = [];
  let initialItems: any[] = [];

  if (supabaseUrl && supabaseAnonKey) {
    try {
      // Use a pure static client without cookie dependencies
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const [catResult, itemResult] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order').order('created_at'),
        supabase.from('menu_items').select('*').order('sort_order').order('created_at'),
      ]);

      if (!catResult.error && catResult.data) {
        initialCategories = catResult.data;
      }
      if (!itemResult.error && itemResult.data) {
        initialItems = itemResult.data;
      }
    } catch (e) {
      console.error('Failed to pre-fetch menu data server-side:', e);
    }
  }

  return <MenuClient initialCategories={initialCategories} initialItems={initialItems} />;
}
