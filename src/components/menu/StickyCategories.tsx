'use client';

import { useRef, useEffect } from 'react';
import type { Category } from '@/types/database';
import clsx from 'clsx';

interface StickyCategoriesProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function StickyCategories({ categories, activeId, onSelect }: StickyCategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active category into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeRef.current;
      const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeId]);

  if (categories.length === 0) return null;

  return (
    <div className="w-full">
      <div className="max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto">
        <div
          ref={scrollRef}
          className="flex gap-1 px-4 py-2.5 overflow-x-auto hide-scrollbar justify-start md:justify-center"
          dir="rtl"
        >
          {categories.map((cat) => {
            const isActive = activeId === cat.id;
            return (
              <button
                key={cat.id}
                ref={isActive ? activeRef : null}
                onClick={() => onSelect(cat.id)}
                className={clsx(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  'whitespace-nowrap',
                  isActive
                    ? 'bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black'
                    : 'text-brand-gray-500 dark:text-brand-gray-400 hover:text-brand-black dark:hover:text-brand-white hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800'
                )}
              >
                {cat.name_ar}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
