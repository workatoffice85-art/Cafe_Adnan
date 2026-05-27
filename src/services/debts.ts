import { createClient } from '@/lib/supabase/client';
import type { Debt } from '@/types/database';

function getSupabase() {
  return createClient();
}

export async function getDebts(): Promise<Debt[]> {
  const { data, error } = await getSupabase()
    .from('debts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createDebt(
  debt: Omit<Debt, 'id' | 'remaining_amount' | 'created_at' | 'updated_at'> & { created_at?: string }
): Promise<Debt> {
  const { data, error } = await getSupabase()
    .from('debts')
    .insert(debt)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDebt(
  id: string,
  updates: Partial<Omit<Debt, 'id' | 'remaining_amount' | 'updated_at'>>
): Promise<Debt> {
  const { data, error } = await getSupabase()
    .from('debts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDebt(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('debts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
