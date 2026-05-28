import MenuClient from './MenuClient';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'القائمة | Cafe Adnan',
  description: 'استعرض قائمة قهوة عدنان — أجود أنواع القهوة والمشروبات والحلويات',
};

export default async function MenuPage() {
  let initialCategories: any[] = [];
  let initialItems: any[] = [];

  try {
    const supabase = await createClient();
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

  return <MenuClient initialCategories={initialCategories} initialItems={initialItems} />;
}
