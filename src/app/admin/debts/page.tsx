'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Wallet, PiggyBank, AlertCircle, Coins, ListChecks, ArrowLeftRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DebtForm } from '@/components/admin/DebtForm';
import { QuickPayModal } from '@/components/admin/QuickPayModal';
import { CustomerLedgerModal } from '@/components/admin/CustomerLedgerModal';
import { StatsCard } from '@/components/admin/StatsCard';
import { EmptyState } from '@/components/EmptyState';
import { PageLoading } from '@/components/LoadingSpinner';
import type { Debt } from '@/types/database';

interface CustomerDebtSummary {
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  transactions_count: number;
  last_transaction_date: string;
  items: Debt[];
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals & Active elements states
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [quickPayDebt, setQuickPayDebt] = useState<Debt | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
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

  const handleQuickPay = async (newPaidAmount: number) => {
    if (!quickPayDebt) return;
    const { error } = await supabase
      .from('debts')
      .update({
        paid_amount: newPaidAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quickPayDebt.id);
    if (error) throw error;
    setQuickPayDebt(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) throw error;
    setDeleteConfirm(null);
  };

  // Group debts by customer name in React
  const groupedDebts = debts.reduce<Record<string, CustomerDebtSummary>>((acc, d) => {
    const name = d.customer_name.trim();
    if (!acc[name]) {
      acc[name] = {
        customer_name: name,
        total_amount: 0,
        paid_amount: 0,
        remaining_amount: 0,
        transactions_count: 0,
        last_transaction_date: d.created_at,
        items: [],
      };
    }
    acc[name].total_amount += Number(d.total_amount) || 0;
    acc[name].paid_amount += Number(d.paid_amount) || 0;
    acc[name].remaining_amount += Number(d.remaining_amount) || 0;
    acc[name].transactions_count += 1;
    acc[name].items.push(d);
    
    if (new Date(d.created_at) > new Date(acc[name].last_transaction_date)) {
      acc[name].last_transaction_date = d.created_at;
    }
    
    return acc;
  }, {});

  // Convert to array and sort: unpaid first, then by remaining balance size
  const customerList = Object.values(groupedDebts).sort((a, b) => {
    if (a.remaining_amount > 0 && b.remaining_amount === 0) return -1;
    if (a.remaining_amount === 0 && b.remaining_amount > 0) return 1;
    return b.remaining_amount - a.remaining_amount;
  });

  // Local filtering based on customer name search
  const filteredCustomers = customerList.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.items.some((item) => item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Financial aggregates (Global)
  const totalDebtsSum = debts.reduce((sum, d) => sum + (Number(d.total_amount) || 0), 0);
  const totalPaidSum = debts.reduce((sum, d) => sum + (Number(d.paid_amount) || 0), 0);
  const totalRemainingSum = debts.reduce((sum, d) => sum + (Number(d.remaining_amount) || 0), 0);

  // Trigger quick pay for a customer group: pay off their oldest unpaid transaction
  const handleQuickPayForCustomerGroup = (customerName: string) => {
    const oldestUnpaid = debts
      .filter((d) => d.customer_name.trim() === customerName && Number(d.remaining_amount) > 0)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

    if (oldestUnpaid) {
      setQuickPayDebt(oldestUnpaid);
    }
  };

  // Safe pre-fill trigger for adding a transaction within a customer's ledger context
  const handleAddNewDebtForCustomer = (customerName: string) => {
    // Construct a mock debt record to pre-populate Name in DebtForm
    setEditingDebt({
      id: '',
      customer_name: customerName,
      description: '',
      total_amount: 0,
      paid_amount: 0,
      remaining_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setShowForm(true);
  };

  if (loading) return <PageLoading />;

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white">دفتر المديونيات</h1>
          <p className="text-sm text-brand-gray-500 mt-1">إجمالي الحسابات والعمليات الآجلة للعملاء بشكل مجمع</p>
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
          placeholder="البحث باسم العميل..."
          dir="rtl"
          className="w-full text-sm bg-transparent border-0 text-brand-black dark:text-brand-white placeholder-brand-gray-400 focus:outline-none focus:ring-0"
        />
      </div>

      {/* Debts Grouped Content */}
      {filteredCustomers.length > 0 ? (
        <>
          {/* Card View (Mobile only) */}
          <div className="space-y-3 md:hidden">
            {filteredCustomers.map((c) => (
              <div
                key={c.customer_name}
                className="bg-brand-white dark:bg-brand-gray-900 rounded-2xl p-4 border border-brand-gray-100 dark:border-brand-gray-800 flex flex-col gap-3"
              >
                {/* Card Top */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      onClick={() => setSelectedCustomer(c.customer_name)}
                      className="text-base font-bold text-brand-black dark:text-brand-white hover:text-brand-beige cursor-pointer transition-colors"
                    >
                      {c.customer_name}
                    </h3>
                    <p className="text-xs text-brand-gray-400 mt-1">
                      {c.transactions_count} معاملة مسجلة
                    </p>
                  </div>
                  {/* Total Remaining Badge */}
                  {c.remaining_amount > 0 ? (
                    <span className="text-[11px] font-bold text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-full">
                      متبقي EGP {c.remaining_amount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-green-500 bg-green-500/10 px-2.5 py-0.5 rounded-full">
                      مسدد بالكامل
                    </span>
                  )}
                </div>

                {/* Financial Totals Row */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-brand-gray-50 dark:bg-brand-gray-800 p-2.5 rounded-xl border border-brand-gray-100/50 dark:border-brand-gray-800/50">
                  <div>
                    <span className="text-brand-gray-400">إجمالي المشتريات:</span>
                    <p className="font-bold text-brand-black dark:text-brand-white mt-0.5">EGP {c.total_amount.toFixed(2)}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-brand-gray-400">إجمالي المسدد:</span>
                    <p className="font-bold text-green-500 mt-0.5 font-semibold">EGP {c.paid_amount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-gray-50 dark:border-brand-gray-800/50">
                  <button
                    onClick={() => setSelectedCustomer(c.customer_name)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-black dark:text-brand-white hover:opacity-90 active:scale-[0.98] transition-all ml-auto"
                  >
                    <ListChecks size={13} />
                    <span>تفاصيل السجل</span>
                  </button>

                  {c.remaining_amount > 0 && (
                    <button
                      onClick={() => handleQuickPayForCustomerGroup(c.customer_name)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-beige/10 hover:bg-brand-beige/20 text-brand-beige transition-all"
                      aria-label="سداد سريع"
                    >
                      <Coins size={13} />
                      <span>دفع مبلغ</span>
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
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider">اسم العميل</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-center w-36">عدد المعاملات</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-center w-40">إجمالي المشتريات الآجلة</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-center w-40">إجمالي المبالغ المسددة</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-center w-40">صافي المتبقي للتحصيل</th>
                  <th className="px-6 py-4 text-xs font-bold text-brand-gray-400 uppercase tracking-wider text-left pl-12 w-64">العمليات والسداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-100 dark:divide-brand-gray-800/50">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.customer_name}
                    className="hover:bg-brand-gray-50/30 dark:hover:bg-brand-gray-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        onClick={() => setSelectedCustomer(c.customer_name)}
                        className="font-bold text-brand-black dark:text-brand-white hover:text-brand-beige cursor-pointer hover:underline underline-offset-4 decoration-2 decoration-brand-beige/50 transition-colors"
                      >
                        {c.customer_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-gray-500 dark:text-brand-gray-400 text-center">
                      {c.transactions_count} معاملة
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-black dark:text-brand-white text-center">
                      EGP {c.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-500 text-center">
                      EGP {c.paid_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {c.remaining_amount > 0 ? (
                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                          EGP {c.remaining_amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                          مسدد بالكامل
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left pl-12">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c.customer_name)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-black dark:text-brand-white hover:bg-brand-gray-200 dark:hover:bg-brand-gray-700 transition-colors"
                        >
                          <ListChecks size={14} />
                          <span>عرض كشف الحساب</span>
                        </button>

                        {c.remaining_amount > 0 && (
                          <button
                            onClick={() => handleQuickPayForCustomerGroup(c.customer_name)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-beige/10 hover:bg-brand-beige/20 text-brand-beige transition-colors"
                          >
                            <Coins size={14} />
                            <span>دفع مبلغ</span>
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
            searchQuery ? 'حاول البحث باسم عميل آخر' : 'ابدأ بتسجيل أول مديونية أو طلب آجل لعميل بالضغط على إضافة أعلاه'
          }
        />
      )}

      {/* Main Debt Form Modal (Create / Edit) */}
      {showForm && (
        <DebtForm
          debt={editingDebt}
          onSubmit={editingDebt?.id ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingDebt(null);
          }}
        />
      )}

      {/* Quick Pay Modal */}
      {quickPayDebt && (
        <QuickPayModal
          debt={quickPayDebt}
          onSubmit={handleQuickPay}
          onClose={() => setQuickPayDebt(null)}
        />
      )}

      {/* Detailed Customer Ledger Modal */}
      {selectedCustomer && (
        <CustomerLedgerModal
          customerName={selectedCustomer}
          transactions={debts.filter((d) => d.customer_name.trim() === selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          onEditTransaction={(debt) => {
            setEditingDebt(debt);
            setShowForm(true);
          }}
          onDeleteTransaction={handleDelete}
          onQuickPayTransaction={(debt) => setQuickPayDebt(debt)}
          onAddNewDebtForCustomer={handleAddNewDebtForCustomer}
        />
      )}
    </div>
  );
}
