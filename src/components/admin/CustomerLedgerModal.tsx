'use client';

import { useState, useEffect } from 'react';
import type { Debt } from '@/types/database';
import { X, Pencil, Trash2, Coins, Calendar, Plus, Wallet, PiggyBank, AlertCircle } from 'lucide-react';

interface CustomerLedgerModalProps {
  customerName: string;
  transactions: Debt[];
  onClose: () => void;
  onEditTransaction: (debt: Debt) => void;
  onDeleteTransaction: (id: string) => void;
  onQuickPayTransaction: (debt: Debt) => void;
  onAddNewDebtForCustomer: (customerName: string) => void;
}

export function CustomerLedgerModal({
  customerName,
  transactions,
  onClose,
  onEditTransaction,
  onDeleteTransaction,
  onQuickPayTransaction,
  onAddNewDebtForCustomer,
}: CustomerLedgerModalProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Aggregates for this customer
  const totalAmount = transactions.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
  const totalPaid = transactions.reduce((sum, t) => sum + (Number(t.paid_amount) || 0), 0);
  const totalRemaining = transactions.reduce((sum, t) => sum + (Number(t.remaining_amount) || 0), 0);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-brand-white dark:bg-brand-gray-900 w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl h-full sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-gray-100 dark:border-brand-gray-800 sticky top-0 bg-brand-white dark:bg-brand-gray-900 z-10">
          <div>
            <h3 className="text-lg font-bold text-brand-black dark:text-brand-white">
              السجل المالي التاريخي: {customerName}
            </h3>
            <p className="text-xs text-brand-gray-400 mt-0.5">
              مجموع {transactions.length} معاملة مسجلة
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
          >
            <X size={20} className="text-brand-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Aggregate Stats for Customer */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-brand-gray-50 dark:bg-brand-gray-800 p-3 rounded-xl border border-brand-gray-100 dark:border-brand-gray-800 flex flex-col items-center text-center">
              <Wallet size={16} className="text-brand-gray-400 mb-1" />
              <span className="text-[10px] text-brand-gray-500">إجمالي المشتريات</span>
              <span className="text-xs font-bold text-brand-black dark:text-brand-white mt-0.5">
                EGP {totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="bg-green-500/5 p-3 rounded-xl border border-green-500/10 flex flex-col items-center text-center">
              <PiggyBank size={16} className="text-green-500 mb-1" />
              <span className="text-[10px] text-brand-gray-500">إجمالي المسدد</span>
              <span className="text-xs font-bold text-green-500 mt-0.5">
                EGP {totalPaid.toFixed(2)}
              </span>
            </div>
            <div className="bg-brand-beige/5 p-3 rounded-xl border border-brand-beige/10 flex flex-col items-center text-center">
              <AlertCircle size={16} className="text-brand-beige mb-1" />
              <span className="text-[10px] text-brand-gray-500">صافي المتبقي</span>
              <span className="text-xs font-bold text-brand-beige mt-0.5">
                EGP {totalRemaining.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Toolbar inside ledger */}
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-brand-black dark:text-brand-white">كشف حركة المعاملات الآجلة</h4>
            <button
              onClick={() => onAddNewDebtForCustomer(customerName)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Plus size={14} />
              <span>إضافة معاملة جديدة</span>
            </button>
          </div>

          {/* Transactions List */}
          {transactions.length > 0 ? (
            <>
              {/* Mobile View inside ledger */}
              <div className="space-y-3 sm:hidden">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="bg-brand-white dark:bg-brand-gray-800 rounded-xl p-3 border border-brand-gray-200 dark:border-brand-gray-800 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5 text-xs text-brand-gray-400">
                        <Calendar size={12} />
                        <span>{formatDate(t.created_at)}</span>
                      </div>
                      {Number(t.remaining_amount) > 0 ? (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                          متبقي EGP {Number(t.remaining_amount).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                          مسدد بالكامل
                        </span>
                      )}
                    </div>

                    {t.description && (
                      <p className="text-xs text-brand-gray-600 dark:text-brand-gray-300 bg-brand-gray-50 dark:bg-brand-gray-900 p-2 rounded-lg">
                        {t.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-brand-gray-100 dark:border-brand-gray-800">
                      <div>
                        <span className="text-brand-gray-400">الإجمالي: </span>
                        <span className="font-semibold text-brand-black dark:text-brand-white">EGP {Number(t.total_amount).toFixed(2)}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-brand-gray-400">المسدد: </span>
                        <span className="font-semibold text-green-500">EGP {Number(t.paid_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions inside ledger (mobile) */}
                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-brand-gray-100 dark:border-brand-gray-800">
                      {Number(t.remaining_amount) > 0 && (
                        <button
                          onClick={() => onQuickPayTransaction(t)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-brand-beige/10 hover:bg-brand-beige/20 text-brand-beige transition-colors ml-auto"
                        >
                          <Coins size={12} />
                          <span>دفع مبلغ</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => onEditTransaction(t)}
                        className="p-2 rounded-lg hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                      >
                        <Pencil size={13} className="text-brand-gray-500" />
                      </button>

                      {deleteConfirmId === t.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDeleteTransaction(t.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            حذف
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-brand-gray-500 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(t.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table View inside ledger (desktop/tablet) */}
              <div className="hidden sm:block overflow-hidden bg-brand-white dark:bg-brand-gray-800 rounded-xl border border-brand-gray-200 dark:border-brand-gray-800">
                <table className="w-full border-collapse text-right text-xs">
                  <thead>
                    <tr className="border-b border-brand-gray-100 dark:border-brand-gray-800 bg-brand-gray-50/50 dark:bg-brand-gray-900/50">
                      <th className="px-4 py-3 font-bold text-brand-gray-400 w-36">التاريخ</th>
                      <th className="px-4 py-3 font-bold text-brand-gray-400">تفاصيل المشتريات / الطلبات</th>
                      <th className="px-4 py-3 font-bold text-brand-gray-400 text-center w-24">الإجمالي</th>
                      <th className="px-4 py-3 font-bold text-brand-gray-400 text-center w-24">المسدد</th>
                      <th className="px-4 py-3 font-bold text-brand-gray-400 text-center w-24">المتبقي</th>
                      <th className="px-4 py-3 font-bold text-brand-gray-400 text-left pl-8 w-44">العمليات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gray-100 dark:divide-brand-gray-800/50">
                    {transactions.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-brand-gray-50/30 dark:hover:bg-brand-gray-800/20 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-brand-gray-450 dark:text-brand-gray-400">
                          {formatDate(t.created_at)}
                        </td>
                        <td className="px-4 py-3 font-medium text-brand-black dark:text-brand-white max-w-[180px] truncate">
                          {t.description || <span className="text-brand-gray-400 italic text-[11px]">لا توجد تفاصيل</span>}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-brand-black dark:text-brand-white">
                          EGP {Number(t.total_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-green-500">
                          EGP {Number(t.paid_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {Number(t.remaining_amount) > 0 ? (
                            <span className="font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                              EGP {Number(t.remaining_amount).toFixed(2)}
                            </span>
                          ) : (
                            <span className="font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                              مسدد
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-left pl-8 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {Number(t.remaining_amount) > 0 && (
                              <button
                                onClick={() => onQuickPayTransaction(t)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold bg-brand-beige/10 hover:bg-brand-beige/20 text-brand-beige transition-colors mr-1"
                              >
                                <Coins size={12} />
                                <span>دفع مبلغ</span>
                              </button>
                            )}

                            <button
                              onClick={() => onEditTransaction(t)}
                              className="p-2 rounded-lg hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                              aria-label="Edit"
                            >
                              <Pencil size={14} className="text-brand-gray-500" />
                            </button>

                            {deleteConfirmId === t.id ? (
                              <div className="flex items-center gap-1 ml-1.5">
                                <button
                                  onClick={() => {
                                    onDeleteTransaction(t.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                  حذف
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1.5 rounded-lg font-medium text-brand-gray-500 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(t.id)}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                aria-label="Delete"
                              >
                                <Trash2 size={14} className="text-red-400" />
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
            <p className="text-center text-sm text-brand-gray-400 py-6">لا توجد معاملات مسجلة لهذا العميل.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-gray-100 dark:border-brand-gray-800 flex justify-end sticky bottom-0 bg-brand-white dark:bg-brand-gray-900">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black hover:opacity-90 active:scale-[0.98] transition-all"
          >
            إغلاق الكشف
          </button>
        </div>
      </div>
    </div>
  );
}
