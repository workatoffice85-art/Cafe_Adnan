import { createClient } from '@/lib/supabase/client';
import type { MenuItem } from '@/types/database';

function getSupabase() {
  return createClient();
}

export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  let query = getSupabase()
    .from('menu_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createMenuItem(
  item: Pick<MenuItem, 'category_id' | 'name_ar' | 'name_en' | 'price' | 'available' | 'sort_order'>
): Promise<MenuItem> {
  const { data, error } = await getSupabase()
    .from('menu_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMenuItem(
  id: string,
  updates: Partial<Pick<MenuItem, 'category_id' | 'name_ar' | 'name_en' | 'price' | 'available' | 'sort_order'>>
): Promise<MenuItem> {
  const { data, error } = await getSupabase()
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleAvailability(id: string, available: boolean): Promise<MenuItem> {
  return updateMenuItem(id, { available });
}
