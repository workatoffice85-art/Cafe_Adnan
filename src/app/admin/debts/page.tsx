'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Wallet, PiggyBank, AlertCircle, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DebtForm } from '@/components/admin/DebtForm';
import { StatsCard } from '@/components/admin/StatsCard';
import { EmptyState } from '@/components/EmptyState';
import { PageLoading } from '@/components/LoadingSpinner';
import type { Debt } from '@/types/database';

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const supabase = createClient();

  const fetchDebts = useCallback(async () => {
    const { data } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });
    setDebts(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDebts();

    const channel = supabase
      .channel('admin-debts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts' }, () => {
        fetchDebts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDebts, supabase]);

  const handleCreate = async (data: {
    customer_name: string;
    description: string;
    total_amount: number;
    paid_amount: number;
    created_at?: string;
  }) => {
    const { error } = await supabase.from('debts').insert(data);
    if (error) throw error;
  };

  const handleUpdate = async (data: {
    customer_name: string;
    description: string;
    total_amount: number;
    paid_amount: number;
    created_at?: string;
  }) => {
    if (!editingDebt) return;
    const { error } = await supabase
      .from('debts')
      .update({
        customer_name: data.customer_name,
        description: data.description,
        total_amount: data.total_amount,
        paid_amount: data.paid_amount,
        created_at: data.created_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingDebt.id);
    if (error) throw error;
    setEditingDebt(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) throw error;
    setDeleteConfirm(null);
  };

  // Live filtered debts list based on search query
  const filteredDebts = debts.filter(
    (d) =>
      d.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Financial aggregate calculations
  const totalDebtsSum = debts.reduce((sum, d) => sum + (Number(d.total_amount) || 0), 0);
  const totalPaidSum = debts.reduce((sum, d) => sum + (Number(d.paid_amount) || 0), 0);
  const totalRemainingSum = debts.reduce((sum, d) => sum + (Number(d.remaining_amount) || 0), 0);

  // Simple date formatter function
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

  if (loading) return <PageLoading />;

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white">دفتر المديونيات</h1>
          <p className="text-sm text-brand-gray-500 mt-1">تتبع الحسابات والطلبات الآجلة لعملاء المقهى</p>
        </div>
        <button
          onClick={() => {
            setEditingDebt(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>تسجيل مديونية جديدة</span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={Wallet}
          label="إجمالي الحسابات المسجلة"
          value={`EGP ${totalDebtsSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatsCard
          icon={PiggyBank}
          label="إجمالي المبالغ المسددة"
          value={`EGP ${totalPaidSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          className="border-green-500/10"
        />
        <StatsCard
          icon={AlertCircle}
          label="صافي الديون المستحقة"
          value={`EGP ${totalRemainingSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          className="border-brand-beige/20 text-brand-beige"
        />
      </div>

      {/* Toolbar / Search */}
      <div className="flex items-center bg-brand-white dark:bg-brand-gray-900 px-4 py-3 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-800">
        <Search size={18} className="text-brand-gray-400 ml-3 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="البحث باسم العميل أو تفاصيل الطلبات..."
          dir="rtl"
          className="w-full text-sm bg-transparent border-0 text-brand-black dark:text-brand-white placeholder-brand-gray-400 focus:outline-none focus:ring-0"
        />
      </div>

      {/* Debts Content */}
      {filteredDebts.length > 0 ? (
        <>
          {/* Card View (Mobile only) */}
          <div className="space-y-3 md:hidden">
            {filteredDebts.map((d) => (
              <div
                key={d.id}
                className="bg-brand-white dark:bg-brand-gray-900 rounded-2xl p-4 border border-brand-gray-100 dark:border-brand-gray-800 flex flex-col gap-3"
              >
                {/* Card Top */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-brand-black dark:text-brand-white">
                      {d.customer_name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-brand-gray-400 mt-1">
                      <Calendar size={12} />
                      <span>{formatDate(d.created_at)}</span>
                    </div>
                  </div>
                  {/* Status Badge */}
                  {Number(d.remaining_amount) > 0 ? (
                    <span className="text-[11px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                      متبقي EGP {Number(d.remaining_amount).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                      مسدد بالكامل
                    </span>
                  )}
                </div>

                {/* Card Description */}
                {d.description && (
                  <p className="text-sm text-brand-gray-600 dark:text-brand-gray-300 bg-brand-gray-50 dark:bg-brand-gray-800/50 p-2.5 rounded-xl">
                    {d.description}
                  </p>
                )}

                {/* Card Totals Row */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-brand-gray-50 dark:border-brand-gray-800/50 pt-2.5">
                  <div>
                    <span className="text-brand-gray-400">الإجمالي: </span>
                    <span className="font-bold text-brand-black dark:text-brand-white">EGP {Number(d.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-brand-gray-400">المسدد: </span>
                    <span className="font-bold text-green-500">EGP {Number(d.paid_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-1 border-t border-brand-gray-50 dark:border-brand-gray-800/50 pt-2">
                  <button
                    onClick={() => {
                      setEditingDebt(d);
                      setShowForm(true);
                    }}
                    className="p-2.5 rounded-xl hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                    aria-label={`Edit ${d.customer_name}`}
                  >
                    <Pencil size={15} className="text-brand-gray-500" />
                  </button>

                  {deleteConfirm === d.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(d.id)}
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
                      onClick={() => setDeleteConfirm(d.id)}
                      className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      aria-label={`Delete ${d.customer_name}`}
                    >
                      <Trash2 size={15} className="text-red-400" />
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
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider w-48">تاريخ المعاملة</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider w-48">العميل</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider">تفاصيل الطلبات / المشتريات</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-center w-32">الإجمالي</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-center w-32">المسدد</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-center w-32">المتبقي الآجل</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-left pl-12 w-36">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-100 dark:divide-brand-gray-800/50">
                {filteredDebts.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-brand-gray-50/30 dark:hover:bg-brand-gray-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500 dark:text-brand-gray-400 font-medium">
                      {formatDate(d.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-black dark:text-brand-white">
                      {d.customer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-gray-600 dark:text-brand-gray-300 font-medium max-w-xs truncate">
                      {d.description || <span className="text-brand-gray-400 italic text-xs">لا توجد تفاصيل</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-black dark:text-brand-white text-center">
                      EGP {Number(d.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-500 text-center">
                      EGP {Number(d.paid_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {Number(d.remaining_amount) > 0 ? (
                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
                          EGP {Number(d.remaining_amount).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">
                          مسدد بالكامل
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left pl-12">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingDebt(d);
                            setShowForm(true);
                          }}
                          className="p-2 rounded-xl hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
                          aria-label={`Edit ${d.customer_name}`}
                        >
                          <Pencil size={16} className="text-brand-gray-500" />
                        </button>

                        {deleteConfirm === d.id ? (
                          <div className="flex items-center gap-1 mr-2">
                            <button
                              onClick={() => handleDelete(d.id)}
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
                            onClick={() => setDeleteConfirm(d.id)}
                            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            aria-label={`Delete ${d.customer_name}`}
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
          title={searchQuery ? 'لا توجد نتائج بحث' : 'دفتر المديونيات فارغ'}
          description={
            searchQuery ? 'حاول البحث بكلمة أخرى أو اسم عميل آخر' : 'ابدأ بتسجيل أول مديونية أو طلب آجل لعميل بالضغط على إضافة أعلاه'
          }
        />
      )}

      {/* Debt Form Modal */}
      {showForm && (
        <DebtForm
          debt={editingDebt}
          onSubmit={editingDebt ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingDebt(null);
          }}
        />
      )}
    </div>
  );
}
