'use client';

import { useState, useEffect } from 'react';
import type { Debt } from '@/types/database';
import { X, Check } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface QuickPayModalProps {
  debt: Debt;
  onSubmit: (paidAmount: number) => Promise<void>;
  onClose: () => void;
}

export function QuickPayModal({ debt, onSubmit, onClose }: QuickPayModalProps) {
  const total = Number(debt.total_amount) || 0;
  const alreadyPaid = Number(debt.paid_amount) || 0;
  const remaining = Number(debt.remaining_amount) || 0;

  const [payAmount, setPayAmount] = useState(remaining.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount) || 0;

    if (amount <= 0) {
      setError('يرجى إدخال مبلغ أكبر من الصفر');
      return;
    }

    if (amount > remaining) {
      setError(`المبلغ المدخل أكبر من المتبقي الفعلي (${remaining.toFixed(2)} EGP)`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newPaidTotal = alreadyPaid + amount;
      await onSubmit(newPaidTotal);
      onClose();
    } catch {
      setError('حدث خطأ أثناء تسجيل السداد، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-white dark:bg-brand-gray-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-gray-100 dark:border-brand-gray-800">
          <h3 className="text-base font-bold text-brand-black dark:text-brand-white">
            تسجيل سداد لـ {debt.customer_name}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800"
          >
            <X size={18} className="text-brand-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2 text-sm bg-brand-gray-50 dark:bg-brand-gray-850 p-3.5 rounded-xl border border-brand-gray-100 dark:border-brand-gray-800">
            {debt.description && (
              <div className="flex justify-between">
                <span className="text-brand-gray-400">الطلب:</span>
                <span className="font-semibold text-brand-black dark:text-brand-white">{debt.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-brand-gray-400">المبلغ الإجمالي:</span>
              <span className="font-semibold text-brand-black dark:text-brand-white">EGP {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-gray-400">المسدد سابقاً:</span>
              <span className="font-semibold text-green-500">EGP {alreadyPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-brand-gray-250 dark:border-brand-gray-800 pt-2 font-bold text-brand-beige">
              <span>المتبقي الآجل:</span>
              <span>EGP {remaining.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
              المبلغ المدفوع الآن (EGP)
            </label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              min="0"
              max={remaining}
              step="0.5"
              dir="ltr"
              className="w-full px-4 py-3 rounded-xl text-base bg-brand-gray-50 dark:bg-brand-gray-855 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige font-bold transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2 text-center">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-brand-beige text-white hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Check size={16} />}
              <span>تأكيد السداد</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-sm font-medium text-brand-gray-500 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
