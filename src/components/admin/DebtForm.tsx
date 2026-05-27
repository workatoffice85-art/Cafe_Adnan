'use client';

import { useState, useEffect } from 'react';
import type { Debt } from '@/types/database';
import { X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface DebtFormProps {
  debt?: Debt | null;
  onSubmit: (data: {
    customer_name: string;
    description: string;
    total_amount: number;
    paid_amount: number;
    created_at?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function DebtForm({ debt, onSubmit, onClose }: DebtFormProps) {
  const [customerName, setCustomerName] = useState(debt?.customer_name || '');
  const [description, setDescription] = useState(debt?.description || '');
  const [totalAmount, setTotalAmount] = useState(debt?.total_amount?.toString() || '');
  const [paidAmount, setPaidAmount] = useState(debt?.paid_amount?.toString() || '0');
  
  // Format created_at to local datetime-local format 'YYYY-MM-DDTHH:MM' or default to now
  const getDefaultDateTime = () => {
    if (debt?.created_at) {
      const d = new Date(debt.created_at);
      const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
      return localISOTime;
    }
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
  };

  const [createdAt, setCreatedAt] = useState(getDefaultDateTime());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!debt;

  // Lock body scroll on mount, unlock on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const total = parseFloat(totalAmount) || 0;
  const paid = parseFloat(paidAmount) || 0;
  const remaining = Math.max(0, total - paid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !totalAmount) {
      setError('يرجى ملء اسم العميل والمبلغ الإجمالي');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse dates safely to ISO string
      const isoDate = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
      
      await onSubmit({
        customer_name: customerName.trim(),
        description: description.trim(),
        total_amount: total,
        paid_amount: paid,
        created_at: isoDate,
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
        <div className="flex items-center justify-between p-4 border-b border-brand-gray-100 dark:border-brand-gray-800 sticky top-0 bg-brand-white dark:bg-brand-gray-900 z-10">
          <h3 className="text-lg font-semibold text-brand-black dark:text-brand-white">
            {isEditing ? 'تعديل مديونية' : 'إضافة مديونية جديدة'}
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
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
              اسم العميل / الشخص
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: أحمد محمد"
              dir="rtl"
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
              تاريخ وتوقيت المعاملة
            </label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors text-right"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
              تفاصيل الطلب / المنتجات
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: طلب 2 كابتشينو وكرواسون شوكولاتة"
              rows={3}
              dir="rtl"
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors resize-none"
            />
          </div>

          {/* Financial Inputs Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
                المبلغ الإجمالي (EGP)
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="100"
                min="0"
                step="0.5"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
                المبلغ المدفوع (EGP)
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="40"
                min="0"
                step="0.5"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors"
              />
            </div>
          </div>

          {/* Live Remaining Preview */}
          <div className="bg-brand-beige/10 border border-brand-beige/25 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-gray-700 dark:text-brand-gray-300">
              المبلغ المتبقي المديون به:
            </span>
            <span className="text-lg font-bold text-brand-beige">
              EGP {remaining.toFixed(2)}
            </span>
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
              {isEditing ? 'حفظ التعديلات' : 'إضافة المديونية'}
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
