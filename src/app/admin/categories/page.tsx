'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { EmptyState } from '@/components/EmptyState';
import { PageLoading } from '@/components/LoadingSpinner';
import type { Category } from '@/types/database';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .order('created_at');
    setCategories(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCategories();

    const channel = supabase
      .channel('admin-categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchCategories, supabase]);

  const handleCreate = async (data: { name_ar: string; name_en: string; sort_order: number }) => {
    const { error } = await supabase.from('categories').insert(data);
    if (error) throw error;
  };

  const handleUpdate = async (data: { name_ar: string; name_en: string; sort_order: number }) => {
    if (!editingCategory) return;
    const { error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', editingCategory.id);
    if (error) throw error;
    setEditingCategory(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    setDeleteConfirm(null);
  };

  if (loading) return <PageLoading />;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white">الأقسام</h1>
          <p className="text-sm text-brand-gray-500 mt-1">{categories.length} قسم</p>
        </div>
        <button
          id="add-category-btn"
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Plus size={18} />
          <span>إضافة</span>
        </button>
      </div>

      {/* Categories List */}
      {categories.length > 0 ? (
        <>
          {/* Card View (Mobile only) */}
          <div className="space-y-2 md:hidden">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-brand-white dark:bg-brand-gray-900 rounded-2xl p-4 border border-brand-gray-100 dark:border-brand-gray-800 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-beige font-semibold bg-brand-beige/10 px-2 py-0.5 rounded-full">
                      #{cat.sort_order}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-brand-black dark:text-brand-white mt-1">
                    {cat.name_ar}
                  </h3>
                  <p className="text-sm text-brand-gray-400">{cat.name_en}</p>
                </div>

                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={() => { setEditingCategory(cat); setShowForm(true); }}
                    className="p-2.5 rounded-xl hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                    aria-label={`Edit ${cat.name_en}`}
                  >
                    <Pencil size={16} className="text-brand-gray-500" />
                  </button>

                  {deleteConfirm === cat.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        حذف
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-gray-500 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      aria-label={`Delete ${cat.name_en}`}
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Table View (Desktop & Tablet) */}
          <div className="hidden md:block overflow-hidden bg-brand-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-800">
            <table className="w-full border-collapse text-right">
              <thead>
                <tr className="border-b border-brand-gray-100 dark:border-brand-gray-800 bg-brand-gray-50/50 dark:bg-brand-gray-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider w-24 text-center">الترتيب</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider">الاسم بالعربية</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider">الاسم بالإنجليزية</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-left pl-12 w-48">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-100 dark:divide-brand-gray-800/50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-brand-gray-50/30 dark:hover:bg-brand-gray-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-xs text-brand-beige font-semibold bg-brand-beige/10 px-2.5 py-1 rounded-full">
                        #{cat.sort_order}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-black dark:text-brand-white">
                      {cat.name_ar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500 dark:text-brand-gray-400 font-medium">
                      {cat.name_en}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left pl-12">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingCategory(cat); setShowForm(true); }}
                          className="p-2 rounded-xl hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                          aria-label={`Edit ${cat.name_en}`}
                        >
                          <Pencil size={16} className="text-brand-gray-500" />
                        </button>

                        {deleteConfirm === cat.id ? (
                          <div className="flex items-center gap-1 mr-2">
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              حذف
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-gray-500 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(cat.id)}
                            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            aria-label={`Delete ${cat.name_en}`}
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState
          title="لا توجد أقسام"
          description="ابدأ بإضافة أقسام القائمة مثل القهوة والحلويات"
        />
      )}

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditingCategory(null); }}
        />
      )}
    </div>
  );
}
