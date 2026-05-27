'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, MenuItem } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { ItemForm } from '@/components/ItemForm';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit3, Trash2, Coffee, Search } from 'lucide-react';

const CATEGORY_LOCAL_KEY = 'cafe_adnan_demo_categories';
const ITEMS_LOCAL_KEY = 'cafe_adnan_demo_items';

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name_ar: 'القهوة', name_en: 'Coffee' },
  { id: 'cat-2', name_ar: 'المشروبات الباردة', name_en: 'Cold Drinks' },
  { id: 'cat-3', name_ar: 'الحلويات', name_en: 'Desserts' }
];

const MOCK_ITEMS: MenuItem[] = [
  { id: 'item-1', category_id: 'cat-1', name_ar: 'إسبيريسو', name_en: 'Espresso', description_ar: 'قهوة إسبريسو مركزة وعطرية', description_en: 'Rich and aromatic single-shot espresso', price: 40.00, available: true },
  { id: 'item-2', category_id: 'cat-1', name_ar: 'أمريكانو', name_en: 'Americano', description_ar: 'إسبريسو مزدوج مخفف بالماء الساخن', description_en: 'Double espresso diluted with hot water', price: 45.00, available: true },
  { id: 'item-3', category_id: 'cat-1', name_ar: 'لاتيه', name_en: 'Latte', description_ar: 'إسبريسو غني مع حليب مبخر مخملي طبقة رقيقة من الرغوة', description_en: 'Double espresso with velvety steamed milk and thin microfoam', price: 55.00, available: true },
  { id: 'item-4', category_id: 'cat-1', name_ar: 'كابتشينو', name_en: 'Cappuccino', description_ar: 'نسب متساوية من الإسبريسو والحليب والرغوة الغنية', description_en: 'Equal parts espresso, milk, and dense foam', price: 60.00, available: true },
  
  { id: 'item-5', category_id: 'cat-2', name_ar: 'أيس لاتيه', name_en: 'Iced Latte', description_ar: 'إسبريسو بارد مع الحليب الطازج ومكعبات الثلج', description_en: 'Chilled espresso with fresh milk and ice cubes', price: 60.00, available: true },
  { id: 'item-6', category_id: 'cat-2', name_ar: 'موكا باردة', name_en: 'Iced Mocha', description_ar: 'مزيج الإسبريسو والشوكولاتة الفاخرة والحليب المثلج', description_en: 'Blended espresso with rich dark chocolate, milk, and ice', price: 65.00, available: true },
  { id: 'item-7', category_id: 'cat-2', name_ar: 'قهوة باردة', name_en: 'Cold Brew', description_ar: 'قهوة محضرة ببطء على البارد لمدة ١٨ ساعة لطعم غني', description_en: 'Slow-steeped cold brew for 18 hours for deep flavor profile', price: 50.00, available: true },
  
  { id: 'item-8', category_id: 'cat-3', name_ar: 'تشيز كيك', name_en: 'Cheesecake', description_ar: 'تشيز كيك نيويورك الكريمية المخبوزة ببطء مع البسكويت المقرمش', description_en: 'Creamy slow-baked New York cheesecake on a crisp graham crust', price: 90.00, available: true },
  { id: 'item-9', category_id: 'cat-3', name_ar: 'براونيز', name_en: 'Brownies', description_ar: 'فودج براونيز بلجيكي غني بقطع الشوكولاتة الداكنة يقدم دافئاً', description_en: 'Rich Belgian fudge brownie packed with chocolate chunks, served warm', price: 75.00, available: true }
];

export default function AdminItems() {
  const { language, t, isRtl } = useLanguage();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const fetchAllData = async () => {
    try {
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      const { data: dbItems } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

      setCategories(dbCategories || MOCK_CATEGORIES);
      setMenuItems(dbItems || MOCK_ITEMS);
    } catch (err) {
      console.error("Supabase failed to load menu list.", err);
      setCategories(MOCK_CATEGORIES);
      setMenuItems(MOCK_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkModeAndFetch = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const demo = !supabaseUrl || supabaseUrl.includes('your-supabase-project') || supabaseUrl.includes('placeholder');
      setIsDemoMode(demo);

      if (demo) {
        // Load categories
        const savedCat = localStorage.getItem(CATEGORY_LOCAL_KEY);
        if (savedCat) {
          setCategories(JSON.parse(savedCat));
        } else {
          setCategories(MOCK_CATEGORIES);
          localStorage.setItem(CATEGORY_LOCAL_KEY, JSON.stringify(MOCK_CATEGORIES));
        }

        // Load items
        const savedItems = localStorage.getItem(ITEMS_LOCAL_KEY);
        if (savedItems) {
          setMenuItems(JSON.parse(savedItems));
        } else {
          setMenuItems(MOCK_ITEMS);
          localStorage.setItem(ITEMS_LOCAL_KEY, JSON.stringify(MOCK_ITEMS));
        }
        setLoading(false);
      } else {
        await fetchAllData();
      }
    };

    checkModeAndFetch();
  }, []);

  const handleSaveItem = async (data: Omit<MenuItem, 'id' | 'created_at'>) => {
    if (isDemoMode) {
      let updated: MenuItem[] = [];
      if (selectedItem) {
        // Edit Mode
        updated = menuItems.map(item => 
          item.id === selectedItem.id 
            ? { ...item, ...data } 
            : item
        );
      } else {
        // Create Mode
        const newItem: MenuItem = {
          id: `item-${Date.now()}`,
          ...data,
          created_at: new Date().toISOString()
        };
        updated = [...menuItems, newItem];
      }
      setMenuItems(updated);
      localStorage.setItem(ITEMS_LOCAL_KEY, JSON.stringify(updated));
    } else {
      // Production Supabase DB save
      if (selectedItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(data)
          .eq('id', selectedItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert(data);
        if (error) throw error;
      }
      await fetchAllData();
    }
    
    setFormOpen(false);
    setSelectedItem(null);
  };

  // Fast availability toggle
  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    if (isDemoMode) {
      const updated = menuItems.map(item => 
        item.id === id ? { ...item, available: !currentStatus } : item
      );
      setMenuItems(updated);
      localStorage.setItem(ITEMS_LOCAL_KEY, JSON.stringify(updated));
    } else {
      const { error } = await supabase
        .from('menu_items')
        .update({ available: !currentStatus })
        .eq('id', id);
      if (error) {
        alert(t.errorOccurred);
      } else {
        // Optimistic local state update to keep UI instant
        setMenuItems(prev => prev.map(item => 
          item.id === id ? { ...item, available: !currentStatus } : item
        ));
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    const confirmDelete = window.confirm(t.deleteConfirm);
    if (!confirmDelete) return;

    if (isDemoMode) {
      const updated = menuItems.filter(item => item.id !== id);
      setMenuItems(updated);
      localStorage.setItem(ITEMS_LOCAL_KEY, JSON.stringify(updated));
    } else {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      if (error) {
        alert(t.errorOccurred);
      } else {
        await fetchAllData();
      }
    }
  };

  // Filter items based on search and category filter
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;
    
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesSearch = 
      item.name_ar.toLowerCase().includes(query) ||
      item.name_en.toLowerCase().includes(query) ||
      (item.description_ar && item.description_ar.toLowerCase().includes(query)) ||
      (item.description_en && item.description_en.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-foreground uppercase">
            {t.manageItems}
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans tracking-wide mt-1">
            {t.manageItemsSub}
          </p>
        </div>
        
        <Button
          onClick={() => {
            setSelectedItem(null);
            setFormOpen(true);
          }}
          variant="accent"
          className="flex items-center justify-center gap-2 self-start py-2.5 text-xs font-bold tracking-widest uppercase rounded-sm select-none"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addItem}</span>
        </Button>
      </div>

      {/* Search and Filters bar */}
      <div className={`flex flex-col md:flex-row gap-4 items-center justify-between`}>
        
        {/* Search Field */}
        <div className="relative w-full md:max-w-md flex items-center">
          <span className={`absolute ${isRtl ? 'right-3' : 'left-3'} text-neutral-400 dark:text-neutral-600`}>
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'البحث عن منتج...' : 'Search items...'}
            className={`w-full py-2.5 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} rounded-sm border border-border bg-card/40 text-sm outline-none placeholder:text-neutral-400 focus:border-[#C5A880]/70 focus:bg-card transition-all font-sans`}
          />
        </div>

        {/* Category Dropdown Filter */}
        <div className="w-full md:w-auto flex items-center gap-2 select-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-sans shrink-0">
            {t.categoryCol}:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-48 py-2 px-3 rounded-sm border border-border bg-card/40 text-xs text-foreground outline-none focus:border-[#C5A880]/70 focus:bg-card transition-all font-sans"
          >
            <option value="all" className="bg-card text-foreground">{t.allCategories}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-card text-foreground">
                {language === 'ar' ? cat.name_ar : cat.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Items Panel */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-6 w-6 text-accent mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 tracking-widest">{t.loading}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border bg-card/10 rounded-sm">
          <Coffee className="h-10 w-10 text-neutral-400 dark:text-neutral-600 mb-4" />
          <p className="text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 max-w-xs font-sans">
            No items found. Create a product or adjust your filters!
          </p>
        </div>
      ) : (
        <div className="border border-border bg-card/30 rounded-sm overflow-hidden select-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-card/30 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  <th className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.itemCol}</th>
                  <th className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.categoryCol}</th>
                  <th className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.priceCol}</th>
                  <th className="px-6 py-4 text-center">{t.statusCol}</th>
                  <th className="px-6 py-4 text-center">{t.actionsCol}</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const cat = categories.find(c => c.id === item.category_id);
                  const catName = cat ? (language === 'ar' ? cat.name_ar : cat.name_en) : '';
                  const itemName = language === 'ar' ? item.name_ar : item.name_en;

                  return (
                    <tr key={item.id} className="border-b border-border/40 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors">
                      <td className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm tracking-wide text-foreground">{itemName}</span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans tracking-wide max-w-xs truncate">
                            {language === 'ar' ? item.description_ar : item.description_en}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-semibold text-sm text-neutral-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {catName}
                      </td>
                      <td className={`px-6 py-4 font-bold text-sm text-foreground tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${item.available ? 'text-emerald-500' : 'text-neutral-400'}`}>
                            {item.available ? t.availableStatus : t.unavailableStatus}
                          </span>
                          <Switch
                            checked={item.available}
                            onChange={() => handleToggleAvailability(item.id, item.available)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-center gap-3">
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setFormOpen(true);
                          }}
                          className="p-2 border border-border text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-sm transition-all active:scale-90"
                          title="Edit Item"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 border border-rose-500/10 text-rose-500 hover:text-white hover:bg-rose-500 rounded-sm transition-all active:scale-90"
                          title="Delete Item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Popup Form Dialog */}
      {formOpen && (
        <ItemForm
          key={selectedItem?.id || 'new'}
          item={selectedItem}
          categories={categories}
          onClose={() => {
            setFormOpen(false);
            setSelectedItem(null);
          }}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}
