'use client';

import React from 'react';
import { MenuItem as MenuItemType } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { formatPrice } from '@/lib/utils';

interface MenuItemProps {
  item: MenuItemType;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { language } = useLanguage();

  const name = language === 'ar' ? item.name_ar : item.name_en;
  const description = language === 'ar' ? item.description_ar : item.description_en;
  const formattedPrice = formatPrice(item.price);

  return (
    <div 
      className={`group py-5 px-1 border-b border-border/40 transition-opacity duration-300 ${
        !item.available ? 'opacity-40 hover:opacity-50' : 'hover:opacity-90'
      }`}
    >
      <div className="flex flex-col gap-1 w-full">
        {/* Row of Name ........... Price */}
        <div className="flex items-baseline w-full justify-between gap-1">
          {/* Name of Product */}
          <span className="font-semibold text-[15px] sm:text-base tracking-widest text-foreground transition-colors group-hover:text-accent">
            {name}
          </span>
          
          {/* Dot Leaders */}
          <span className="dot-leader-dots" />

          {/* Pricing */}
          <span className="font-bold text-[15px] sm:text-base text-foreground tracking-widest whitespace-nowrap">
            {formattedPrice}
          </span>
        </div>

        {/* Product Description & Availability Info */}
        <div className="flex items-center justify-between mt-1 select-none">
          {description ? (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans tracking-wide leading-relaxed max-w-[80%]">
              {description}
            </p>
          ) : (
            <div />
          )}

          {/* Out of Stock Label */}
          {!item.available && (
            <span className="text-[10px] font-bold tracking-widest uppercase border border-rose-500/30 text-rose-500 px-1.5 py-0.5 rounded-sm bg-rose-500/5">
              {language === 'ar' ? 'غير متاح' : 'Sold Out'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default MenuItem;
