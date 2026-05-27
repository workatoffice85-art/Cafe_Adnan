'use client';

import React from 'react';
import { Category, MenuItem as MenuItemType } from '@/types';
import { MenuItem } from './MenuItem';
import { useLanguage } from '@/hooks/useLanguage';

interface MenuSectionProps {
  category: Category;
  items: MenuItemType[];
}

export const MenuSection: React.FC<MenuSectionProps> = ({ category, items }) => {
  const { language } = useLanguage();

  if (items.length === 0) return null;

  const categoryName = language === 'ar' ? category.name_ar : category.name_en;

  return (
    <section 
      id={category.id} 
      className="scroll-mt-32 py-4 animate-fade-in"
    >
      {/* Category Section Header */}
      <div className="flex items-center gap-3 mb-4 select-none">
        <h2 className="font-bold text-base sm:text-lg tracking-widest text-foreground uppercase">
          {categoryName}
        </h2>
        {/* Subtle Luxury Accent Line */}
        <div className="h-[1px] bg-accent/30 flex-grow rounded-full" />
      </div>

      {/* Menu Items List */}
      <div className="flex flex-col">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
export default MenuSection;
