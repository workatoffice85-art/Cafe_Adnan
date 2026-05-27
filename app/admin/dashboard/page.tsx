'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, MenuItem, AdminStats } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { formatPrice } from '@/lib/utils';
import { QRCard } from '@/components/QRCard';
import { 
  Coffee, 
  FolderOpen, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Printer,
  QrCode
} from 'lucide-react';

// Premium Mock Data fallbacks matching public menu
const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name_ar: 'القهوة', name_en: 'Coffee' },
  { id: 'cat-2', name_ar: 'المشروبات الباردة', name_en: 'Cold Drinks' },
  { id: 'cat-3', name_ar: 'الحلويات', name_en: 'Desserts' }
];

const MOCK_ITEMS: MenuItem[] = [
  { id: 'item-1', category_id: 'cat-1', name_ar: 'إسبيريسو', name_en: 'Espresso', price: 40.00, available: true },
  { id: 'item-2', category_id: 'cat-1', name_ar: 'أمريكانو', name_en: 'Americano', price: 45.00, available: true },
  { id: 'item-3', category_id: 'cat-1', name_ar: 'لاتيه', name_en: 'Latte', price: 55.00, available: true },
  { id: 'item-4', category_id: 'cat-1', name_ar: 'كابتشينو', name_en: 'Cappuccino', price: 60.00, available: true },
  { id: 'item-5', category_id: 'cat-2', name_ar: 'أيس لاتيه', name_en: 'Iced Latte', price: 60.00, available: true },
  { id: 'item-6', category_id: 'cat-2', name_ar: 'موكا باردة', name_en: 'Iced Mocha', price: 65.00, available: true },
  { id: 'item-7', category_id: 'cat-2', name_ar: 'قهوة باردة', name_en: 'Cold Brew', price: 50.00, available: false },
  { id: 'item-8', category_id: 'cat-3', name_ar: 'تشيز كيك', name_en: 'Cheesecake', price: 90.00, available: true },
  { id: 'item-9', category_id: 'cat-3', name_ar: 'براونيز', name_en: 'Brownies', price: 75.00, available: false }
];

export default function AdminDashboard() {
  const { language, t, isRtl } = useLanguage();
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_ITEMS);
  const [stats, setStats] = useState<AdminStats>({
    totalCategories: 3,
    totalItems: 9,
    availableItems: 7,
    unavailableItems: 2
  });
  const [isLoading, setIsLoading] = useState(true);
  const [qrBaseUrl, setQrBaseUrl] = useState('https://cafeadnan.com');

  const fetchDashboardData = async () => {
    try {
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('*');

      const { data: dbItems } = await supabase
        .from('menu_items')
        .select('*');

      const finalCategories = dbCategories && dbCategories.length > 0 ? dbCategories : MOCK_CATEGORIES;
      const finalItems = dbItems && dbItems.length > 0 ? dbItems : MOCK_ITEMS;

      setCategories(finalCategories);
      setMenuItems(finalItems);

      const totalCategories = finalCategories.length;
      const totalItems = finalItems.length;
      const availableItems = finalItems.filter(i => i.available).length;
      const unavailableItems = totalItems - availableItems;

      setStats({
        totalCategories,
        totalItems,
        availableItems,
        unavailableItems
      });
    } catch (e) {
      console.warn("Failed to load DB stats. Using placeholder dashboard layout.", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
    
    // Set dynamic local URL for QR Code generator
    if (typeof window !== 'undefined') {
      setQrBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  const metricCards = [
    {
      title: t.totalItems,
      value: stats.totalItems,
      icon: Coffee,
      color: 'text-accent',
      bgColor: 'bg-accent/5'
    },
    {
      title: t.totalCategories,
      value: stats.totalCategories,
      icon: FolderOpen,
      color: 'text-neutral-400 dark:text-neutral-500',
      bgColor: 'bg-card'
    },
    {
      title: t.availableItems,
      value: stats.availableItems,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/5'
    },
    {
      title: t.unavailableItems,
      value: stats.unavailableItems,
      icon: XCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/5'
    }
  ];

  return (
    <div className="space-y-10">
      
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl font-bold tracking-widest text-foreground uppercase">
          {t.dashboardTitle}
        </h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans tracking-wide mt-1">
          {t.dashboardSub}
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 select-none">
        {metricCards.map((card, i) => (
          <div 
            key={i} 
            className="p-5 border border-border bg-card/40 rounded-sm flex items-center justify-between transition-all duration-300 hover:border-accent/40"
          >
            <div className="space-y-1">
              <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-sans">
                {card.title}
              </span>
              <span className="block text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {card.value}
              </span>
            </div>
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center border border-border/40 ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Sub-layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Products list (Col-span 2) */}
        <div className="lg:col-span-2 border border-border bg-card/30 rounded-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">
              {t.recentItems}
            </h3>
            <span className="text-[10px] tracking-wider text-neutral-400 uppercase font-sans flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
              {language === 'ar' ? 'مزامنة فورية' : 'Live Sync'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  <th className={`pb-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t.itemCol}</th>
                  <th className={`pb-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t.categoryCol}</th>
                  <th className={`pb-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t.priceCol}</th>
                  <th className={`pb-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t.statusCol}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center font-semibold text-neutral-400 font-sans">
                      {t.loading}
                    </td>
                  </tr>
                ) : menuItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center font-semibold text-neutral-400 font-sans">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  menuItems.slice(0, 5).map((item) => {
                    const cat = categories.find(c => c.id === item.category_id);
                    const catName = cat ? (language === 'ar' ? cat.name_ar : cat.name_en) : '';
                    const itemName = language === 'ar' ? item.name_ar : item.name_en;

                    return (
                      <tr key={item.id} className="border-b border-border/40 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors">
                        <td className={`py-4 font-bold tracking-wide text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{itemName}</td>
                        <td className={`py-4 font-semibold text-neutral-400 ${isRtl ? 'text-right' : 'text-left'}`}>{catName}</td>
                        <td className={`py-4 font-bold tracking-wider text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{formatPrice(item.price)}</td>
                        <td className={`py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-sm ${
                            item.available
                              ? 'bg-emerald-500/5 text-emerald-500 border border-emerald-500/20'
                              : 'bg-rose-500/5 text-rose-500 border border-rose-500/20'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {item.available ? t.availableStatus : t.unavailableStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable QR code Card layout (Col-span 1) */}
        <div className="border border-border bg-card/30 rounded-sm p-6 space-y-6 flex flex-col justify-between">
          <div className="border-b border-border/40 pb-4 flex items-center justify-between select-none">
            <h3 className="text-xs font-bold tracking-widest uppercase text-foreground flex items-center gap-2">
              <QrCode className="h-4 w-4 text-accent" />
              {t.qrCodeCard}
            </h3>
          </div>

          {/* Render QR Card Mock */}
          <div className="flex justify-center my-2 scale-90 sm:scale-100 print-qr-card-container">
            <QRCard value={`${qrBaseUrl}/menu`} />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-sans">
                {t.qrDomainLabel}
              </span>
              <input
                type="text"
                value={`${qrBaseUrl}/menu`}
                onChange={(e) => setQrBaseUrl(e.target.value.replace(/\/menu$/, ''))}
                className="w-full text-[11px] font-mono p-2 border border-border bg-background/50 rounded-sm outline-none text-foreground select-text"
              />
            </div>

            {/* Print trigger button */}
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 bg-[#C5A880] text-black hover:bg-[#D4BD96] py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm transition-all active:scale-[0.98] select-none"
            >
              <Printer className="h-4 w-4" />
              <span>{t.printCard}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
