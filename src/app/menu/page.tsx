import MenuClient from './MenuClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'القائمة | Cafe Adnan',
  description: 'استعرض قائمة قهوة عدنان — أجود أنواع القهوة والمشروبات والحلويات',
};

export default function MenuPage() {
  // Pass empty initial data — client component will fetch from Supabase
  return <MenuClient initialCategories={[]} initialItems={[]} />;
}
