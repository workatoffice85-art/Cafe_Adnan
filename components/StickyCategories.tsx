'use client';

import React, { useRef, useEffect } from 'react';
import { Category } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';

interface StickyCategoriesProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string) => void;
}

export const StickyCategories: React.FC<StickyCategoriesProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  const { language, t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const tab = activeTabRef.current;
      
      const containerWidth = container.offsetWidth;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;

      // Centering the active tab in the scroll view
      const targetScrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });
    }
  }, [activeCategoryId]);

  return (
    <div className="sticky top-[64px] z-30 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex overflow-x-auto py-3 gap-2 sm:gap-4 scroll-smooth"
        >
          {/* "All Items" tab */}
          <button
            ref={activeCategoryId === null ? activeTabRef : null}
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-widest uppercase rounded-sm border transition-all duration-200 select-none active:scale-95 ${
              activeCategoryId === null
                ? 'border-[#C5A880] bg-[#C5A880]/5 text-[#C5A880]'
                : 'border-transparent text-neutral-500 hover:text-foreground'
            }`}
          >
            {t.allProducts}
          </button>

          {/* Individual Category tabs */}
          {categories.map((category) => {
            const isActive = activeCategoryId === category.id;
            const name = language === 'ar' ? category.name_ar : category.name_en;

            return (
              <button
                key={category.id}
                ref={isActive ? activeTabRef : null}
                onClick={() => onSelectCategory(category.id)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-widest uppercase rounded-sm border transition-all duration-200 select-none active:scale-95 ${
                  isActive
                    ? 'border-[#C5A880] bg-[#C5A880]/5 text-[#C5A880]'
                    : 'border-transparent text-neutral-500 hover:text-foreground'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default StickyCategories;
