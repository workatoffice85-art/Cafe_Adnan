'use client';

import { useState, useEffect } from 'react';
import type { Category } from '@/types/database';
import { X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: { name_ar: string; name_en: string; sort_order: number }) => Promise<void>;
  onClose: () => void;
}

export function CategoryForm({ category, onSubmit, onClose }: CategoryFormProps) {
  const [nameAr, setNameAr] = useState(category?.name_ar || '');
  const [nameEn, setNameEn] = useState(category?.name_en || '');
  const [sortOrder, setSortOrder] = useState(category?.sort_order || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!category;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim()) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({ name_ar: nameAr.trim(), name_en: nameEn.trim(), sort_order: sortOrder });
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
        <div className="flex items-center justify-between p-4 border-b border-brand-gray-100 dark:border-brand-gray-800">
          <h3 className="text-lg font-semibold text-brand-black dark:text-brand-white">
            {isEditing ? 'تعديل القسم' : 'إضافة قسم جديد'}
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
          <div>
            <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
              اسم القسم (عربي)
            </label>
            <input
              type="text"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: القهوة الساخنة"
              dir="rtl"
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
              اسم القسم (إنجليزي)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Hot Coffee"
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
              min={0}
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2.5 text-center">
              {error}
            </p>
          )}

          {/* Sticky bottom buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              {isEditing ? 'حفظ التعديلات' : 'إضافة القسم'}
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
