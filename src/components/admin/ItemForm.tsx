'use client';

import { useState, useEffect } from 'react';
import type { MenuItem, Category } from '@/types/database';
import { X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase/client';

interface ItemFormProps {
  item?: MenuItem | null;
  onSubmit: (data: {
    category_id: string;
    name_ar: string;
    name_en: string;
    price: number;
    available: boolean;
    sort_order: number;
  }) => Promise<void>;
  onClose: () => void;
}

export function ItemForm({ item, onSubmit, onClose }: ItemFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(item?.category_id || '');
  const [nameAr, setNameAr] = useState(item?.name_ar || '');
  const [nameEn, setNameEn] = useState(item?.name_en || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [available, setAvailable] = useState(item?.available ?? true);
  const [sortOrder, setSortOrder] = useState(item?.sort_order || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!item;

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      setCategories(data || []);
      if (!categoryId && data && data.length > 0) {
        setCategoryId(data[0].id);
      }
    }
    fetchCategories();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim() || !price || !categoryId) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        category_id: categoryId,
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
        price: parseFloat(price),
        available,
        sort_order: sortOrder,
      });
      onClose();
    } catch {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-brand-white dark:bg-brand-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-gray-100 dark:border-brand-gray-800 sticky top-0 bg-brand-white dark:bg-brand-gray-900">
          <h3 className="text-lg font-semibold text-brand-black dark:text-brand-white">
            {isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800"
          >
            <X size={20} className="text-brand-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
              القسم
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_ar} — {cat.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Arabic Name */}
          <div>
            <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
              اسم المنتج (عربي)
            </label>
            <input
              type="text"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: لاتيه"
              dir="rtl"
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
            />
          </div>

          {/* English Name */}
          <div>
            <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
              اسم المنتج (إنجليزي)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Latte"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
            />
          </div>

          {/* Price and Sort Order row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
                السعر (EGP)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="55"
                min="0"
                step="0.5"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
                ترتيب العرض
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                min="0"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400">
              متاح للطلب
            </span>
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={`w-12 h-7 rounded-full transition-colors duration-200 relative ${
                available ? 'bg-brand-beige' : 'bg-brand-gray-300 dark:bg-brand-gray-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  available ? 'left-0.5' : 'left-[22px]'
                }`}
              />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2.5 text-center">
              {error}
            </p>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              {isEditing ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
