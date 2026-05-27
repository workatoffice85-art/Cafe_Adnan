import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/types/database';

function getSupabase() {
  return createClient();
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCategory(
  category: Pick<Category, 'name_ar' | 'name_en' | 'sort_order'>
): Promise<Category> {
  const { data, error } = await getSupabase()
    .from('categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  updates: Partial<Pick<Category, 'name_ar' | 'name_en' | 'sort_order'>>
): Promise<Category> {
  const { data, error } = await getSupabase()
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
