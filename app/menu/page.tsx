'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { StickyCategories } from '@/components/StickyCategories';
import { MenuSection } from '@/components/MenuSection';
import { EmptyState } from '@/components/EmptyState';
import { Logo } from '@/components/Logo';
import { Category, MenuItem } from '@/types';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/hooks/useLanguage';

// Premium Mock Data matching Cafe Adnan's aesthetic and screenshot specifications
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

export default function MenuPage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isScrollingRef = useRef(false);

  // Fetch from Supabase with fallbacks
  const fetchMenuData = async () => {
    try {
      const { data: dbCategories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      const { data: dbItems } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (dbCategories && dbCategories.length > 0) {
        setCategories(dbCategories);
      }
      if (dbItems && dbItems.length > 0) {
        setMenuItems(dbItems);
      }
    } catch (e) {
      console.warn("Using high-fidelity mockup data due to offline database configuration.", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMenuData();

    // Subscribe to Supabase database changes in real-time
    const categoriesChannel = supabase
      .channel('realtime-menu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchMenuData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        fetchMenuData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesChannel);
    };
  }, []);

  // Update active category on page scroll using IntersectionObserver
  useEffect(() => {
    if (isLoading || isScrollingRef.current) return;

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px', // Triggers when element occupies the upper half
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingRef.current) return;
      
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // Find the topmost visible section
        const topElement = visibleEntries[0].target;
        setActiveCategory(topElement.id);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    categories.forEach((cat) => {
      const element = document.getElementById(cat.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [categories, isLoading]);

  // Click handler to jump to category smoothly
  const handleCategorySelect = (id: string) => {
    if (id === 'all') {
      setActiveCategory(null);
      isScrollingRef.current = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => { isScrollingRef.current = false; }, 800);
      return;
    }

    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      isScrollingRef.current = true;
      const navbarHeight = 64; // header height
      const stickyTabsHeight = 56; // sticky tab category height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      
      window.scrollTo({
        top: elementPosition - navbarHeight - stickyTabsHeight + 10,
        behavior: 'smooth'
      });

      // Release scroll block after smooth scrolling animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  // Fast customer search filter
  const filteredItems = menuItems.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const nameAr = item.name_ar.toLowerCase();
    const nameEn = item.name_en.toLowerCase();
    const descAr = item.description_ar?.toLowerCase() || '';
    const descEn = item.description_en?.toLowerCase() || '';

    return nameAr.includes(query) || nameEn.includes(query) || descAr.includes(query) || descEn.includes(query);
  });

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans select-none pb-12 transition-colors duration-300">
      {/* Brand Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Splash Brand Header */}
        <section className="flex flex-col items-center justify-center pt-10 pb-6 text-center select-none animate-fade-in">
          <Logo size="lg" className="scale-95" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-foreground uppercase mt-2">
            {t.brandName}
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-accent mt-1.5 uppercase">
            {t.brandSub}
          </p>
        </section>

        {/* Dynamic Search */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-6 w-6 text-accent mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 tracking-widest">{t.loading}</p>
          </div>
        ) : (
          <>
            {/* Sticky Navigation bar */}
            {!searchQuery && categories.length > 0 && (
              <StickyCategories
                categories={categories}
                activeCategoryId={activeCategory}
                onSelectCategory={handleCategorySelect}
              />
            )}

            {/* Menu List Area */}
            <div className="mt-4">
              {filteredItems.length === 0 ? (
                <EmptyState type="search" />
              ) : searchQuery ? (
                // Single list view for searches
                <div className="space-y-6">
                  <div className="flex items-center gap-3 select-none">
                    <h3 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                      {t.allProducts} ({filteredItems.length})
                    </h3>
                    <div className="h-[1px] bg-border/40 flex-grow" />
                  </div>
                  <div className="flex flex-col">
                    {filteredItems.map((item) => (
                      <MenuSectionItemsHelper key={item.id} item={item} categories={categories} />
                    ))}
                  </div>
                </div>
              ) : (
                // Categorized list view
                categories.map((category) => {
                  const categoryItems = filteredItems.filter(item => item.category_id === category.id);
                  return (
                    <MenuSection
                      key={category.id}
                      category={category}
                      items={categoryItems}
                    />
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Footer brand marker */}
        <footer className="mt-20 border-t border-border/20 pt-8 pb-4 text-center select-none text-[10px] sm:text-xs text-neutral-400 dark:text-neutral-600 font-sans tracking-widest">
          <p>© {new Date().getFullYear()} {language === 'ar' ? 'قهوة عدنان. جميع الحقوق محفوظة.' : 'Cafe Adnan. All rights reserved.'}</p>
        </footer>
      </main>
    </div>
  );
}

// Sub-component to helper-render item with its category indicator in searches
const MenuSectionItemsHelper: React.FC<{ item: MenuItem; categories: Category[] }> = ({ item, categories }) => {
  const { language } = useLanguage();
  const category = categories.find(c => c.id === item.category_id);
  const catName = category ? (language === 'ar' ? category.name_ar : category.name_en) : '';

  return (
    <div className="relative">
      {catName && (
        <span className="absolute -top-1 right-1 text-[8px] tracking-widest text-accent uppercase font-bold select-none opacity-80">
          {catName}
        </span>
      )}
      <div className="pt-2">
        <MenuSection category={{ id: 'x', name_ar: '', name_en: '' }} items={[item]} />
      </div>
    </div>
  );
};
