'use client';

import { useEffect, useState } from 'react';
import { FolderOpen, UtensilsCrossed, CheckCircle, XCircle } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { createClient } from '@/lib/supabase/client';
import { PageLoading } from '@/components/LoadingSpinner';
import Link from 'next/link';
import { MenuItem } from '@/types/database';

interface Stats {
  totalCategories: number;
  totalItems: number;
  availableItems: number;
  unavailableItems: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      const [catResult, itemResult] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact' }),
        supabase.from('menu_items').select('id, available', { count: 'exact' }),
      ]);

      const totalCategories = catResult.count || 0;
      const items = itemResult.data || [];
      const totalItems = items.length;
      const availableItems = items.filter((i: MenuItem) => i.available).length;
      const unavailableItems = totalItems - availableItems;

      setStats({ totalCategories, totalItems, availableItems, unavailableItems });
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) return <PageLoading />;

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white">
          لوحة التحكم
        </h1>
        <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 mt-1">
          نظرة عامة على قائمة قهوة عدنان
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
        <StatsCard
          icon={FolderOpen}
          label="الأقسام"
          value={stats?.totalCategories || 0}
        />
        <StatsCard
          icon={UtensilsCrossed}
          label="المنتجات"
          value={stats?.totalItems || 0}
        />
        <StatsCard
          icon={CheckCircle}
          label="متاح"
          value={stats?.availableItems || 0}
        />
        <StatsCard
          icon={XCircle}
          label="غير متاح"
          value={stats?.unavailableItems || 0}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-black dark:text-brand-white">
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 p-4 bg-brand-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-800 hover:border-brand-beige dark:hover:border-brand-beige transition-colors duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-beige/10 flex items-center justify-center">
              <FolderOpen size={20} className="text-brand-beige" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-black dark:text-brand-white">
                إدارة الأقسام
              </p>
              <p className="text-xs text-brand-gray-400">إضافة وتعديل الأقسام</p>
            </div>
          </Link>

          <Link
            href="/admin/items"
            className="flex items-center gap-3 p-4 bg-brand-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-800 hover:border-brand-beige dark:hover:border-brand-beige transition-colors duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-beige/10 flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-brand-beige" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-black dark:text-brand-white">
                إدارة المنتجات
              </p>
              <p className="text-xs text-brand-gray-400">إضافة وتعديل المنتجات</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
