'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ItemForm } from '@/components/admin/ItemForm';
import { EmptyState } from '@/components/EmptyState';
import { PageLoading } from '@/components/LoadingSpinner';
import type { MenuItem, Category } from '@/types/database';
import clsx from 'clsx';

export default function ItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const [itemResult, catResult] = await Promise.all([
      supabase.from('menu_items').select('*').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    setItems(itemResult.data || []);
    setCategories(catResult.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('admin-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, supabase]);

  const handleCreate = async (data: {
    category_id: string; name_ar: string; name_en: string;
    price: number; available: boolean; sort_order: number;
  }) => {
    const { error } = await supabase.from('menu_items').insert(data);
    if (error) throw error;
  };

  const handleUpdate = async (data: {
    category_id: string; name_ar: string; name_en: string;
    price: number; available: boolean; sort_order: number;
  }) => {
    if (!editingItem) return;
    const { error } = await supabase.from('menu_items').update(data).eq('id', editingItem.id);
    if (error) throw error;
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
    setDeleteConfirm(null);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id);
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    return cat?.name_ar || '';
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = !search ||
      item.name_ar.toLowerCase().includes(search.toLowerCase()) ||
      item.name_en.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <PageLoading />;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white">المنتجات</h1>
          <p className="text-sm text-brand-gray-500 mt-1">{items.length} منتج</p>
        </div>
        <button
          id="add-item-btn"
          onClick={() => { setEditingItem(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          <span>إضافة</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm bg-brand-white dark:bg-brand-gray-900 border border-brand-gray-200 dark:border-brand-gray-800 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm bg-brand-white dark:bg-brand-gray-900 border border-brand-gray-200 dark:border-brand-gray-800 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors appearance-none"
        >
          <option value="all">جميع الأقسام</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
          ))}
        </select>
      </div>

      {/* Items List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-brand-white dark:bg-brand-gray-900 rounded-2xl p-4 border border-brand-gray-100 dark:border-brand-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-brand-beige font-medium bg-brand-beige/10 px-2 py-0.5 rounded-full">
                      {getCategoryName(item.category_id)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-brand-black dark:text-brand-white">
                    {item.name_ar}
                  </h3>
                  <p className="text-sm text-brand-gray-400">{item.name_en}</p>
                  <p className="text-sm font-bold text-brand-black dark:text-brand-white mt-1">
                    {item.price} <span className="text-xs text-brand-gray-400 font-normal">EGP</span>
                  </p>
                </div>

                <div className="flex items-center gap-1 mr-2">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={clsx(
                      'w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0',
                      item.available ? 'bg-brand-beige' : 'bg-brand-gray-300 dark:bg-brand-gray-700'
                    )}
                    aria-label={item.available ? 'Mark unavailable' : 'Mark available'}
                  >
                    <span
                      className={clsx(
                        'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                        item.available ? 'left-0.5' : 'left-[22px]'
                      )}
                    />
                  </button>

                  <button
                    onClick={() => { setEditingItem(item); setShowForm(true); }}
                    className="p-2 rounded-xl hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                  >
                    <Pencil size={16} className="text-brand-gray-500" />
                  </button>

                  {deleteConfirm === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white"
                      >
                        حذف
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2.5 py-1 rounded-lg text-xs text-brand-gray-500"
                      >
                        لا
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={search || filterCategory !== 'all' ? 'لا توجد نتائج' : 'لا توجد منتجات'}
          description={search || filterCategory !== 'all' ? 'جرّب تغيير البحث أو الفلتر' : 'ابدأ بإضافة منتجات القائمة'}
        />
      )}

      {/* Item Form Modal */}
      {showForm && (
        <ItemForm
          item={editingItem}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}
