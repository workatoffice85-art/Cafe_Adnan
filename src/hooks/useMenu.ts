'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Category, MenuItem, CategoryWithItems } from '@/types/database';

export function useMenu(initialCategories?: Category[], initialItems?: MenuItem[]) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [items, setItems] = useState<MenuItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialCategories || initialCategories.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();

      const [catResult, itemResult] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').order('sort_order'),
      ]);

      if (catResult.error) throw catResult.error;
      if (itemResult.error) throw itemResult.error;

      setCategories(catResult.data || []);
      setItems(itemResult.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscriptions
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Group items by category
  const menuSections: CategoryWithItems[] = categories.map((cat) => ({
    ...cat,
    menu_items: items.filter(
      (item) => item.category_id === cat.id && item.available
    ),
  }));

  // All sections (including unavailable items, for admin)
  const allSections: CategoryWithItems[] = categories.map((cat) => ({
    ...cat,
    menu_items: items.filter((item) => item.category_id === cat.id),
  }));

  return {
    categories,
    items,
    menuSections,
    allSections,
    loading,
    error,
    refetch: fetchData,
  };
}
