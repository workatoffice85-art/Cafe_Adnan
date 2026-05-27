'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMenu } from '@/hooks/useMenu';
import { MenuHeader } from '@/components/menu/MenuHeader';
import { SearchBar } from '@/components/menu/SearchBar';
import { StickyCategories } from '@/components/menu/StickyCategories';
import { MenuSection } from '@/components/menu/MenuSection';
import { EmptyState } from '@/components/EmptyState';
import { PageLoading } from '@/components/LoadingSpinner';
import type { Category, MenuItem, CategoryWithItems } from '@/types/database';

interface MenuClientProps {
  initialCategories: Category[];
  initialItems: MenuItem[];
}

export default function MenuClient({ initialCategories, initialItems }: MenuClientProps) {
  const { menuSections, categories, loading } = useMenu(initialCategories, initialItems);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Set initial active category
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Track active category based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map((cat) => {
        const el = document.getElementById(`category-${cat.id}`);
        if (!el) return { id: cat.id, top: Infinity };
        const rect = el.getBoundingClientRect();
        return { id: cat.id, top: Math.abs(rect.top - 130) };
      });

      const closest = sections.reduce((prev, curr) =>
        curr.top < prev.top ? curr : prev
      );

      if (closest.id) {
        setActiveCategory(closest.id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  // Handle category selection
  const handleCategorySelect = useCallback((id: string) => {
    setActiveCategory(id);
    const el = document.getElementById(`category-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Filter sections by search
  const filteredSections: CategoryWithItems[] = useMemo(() => {
    if (!search.trim()) return menuSections;

    const query = search.trim().toLowerCase();
    return menuSections
      .map((section) => ({
        ...section,
        menu_items: section.menu_items.filter(
          (item) =>
            item.name_ar.toLowerCase().includes(query) ||
            item.name_en.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.menu_items.length > 0);
  }, [menuSections, search]);

  if (loading) return <PageLoading />;

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-black">
      {/* Sticky Header Block */}
      <div className="sticky top-0 z-50 bg-brand-white/95 dark:bg-brand-black/95 backdrop-blur-sm border-b border-brand-gray-100 dark:border-brand-gray-800">
        <MenuHeader />
        <StickyCategories
          categories={categories}
          activeId={activeCategory}
          onSelect={handleCategorySelect}
        />
        {/* Sticky Search Bar */}
        <div className="max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-4 pb-3 pt-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>

      <main className="max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-5 pb-12">

        {/* Menu Sections */}
        {filteredSections.length > 0 ? (
          <div>
            {filteredSections.map((section) => (
              <MenuSection key={section.id} section={section} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={search ? 'لا توجد نتائج' : 'القائمة فارغة'}
            description={
              search
                ? 'جرّب البحث بكلمة مختلفة'
                : 'سيتم إضافة العناصر قريباً'
            }
          />
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-brand-gray-100 dark:border-brand-gray-800 text-center">
          <p className="text-xs text-brand-gray-400 dark:text-brand-gray-600">
            قهوة عدنان — Cafe Adnan
          </p>
          <p className="text-[10px] text-brand-gray-300 dark:text-brand-gray-700 mt-1">
            جميع الأسعار شاملة الضرائب
          </p>
        </footer>
      </main>
    </div>
  );
}
