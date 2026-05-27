import type { MenuItem as MenuItemType } from '@/types/database';
import clsx from 'clsx';

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  return (
    <div
      className={clsx(
        'flex items-baseline gap-1 py-3.5',
        !item.available && 'opacity-40'
      )}
    >
      {/* Item names */}
      <div className="flex flex-col min-w-0 flex-shrink-0">
        <span className="text-[15px] font-semibold text-brand-black dark:text-brand-white leading-tight">
          {item.name_ar}
        </span>
        <span className="text-[12px] text-brand-gray-400 dark:text-brand-gray-500 font-normal leading-tight mt-0.5">
          {item.name_en}
        </span>
      </div>

      {/* Dotted line */}
      <div className="menu-dots" />

      {/* Price */}
      <div className="flex-shrink-0 flex items-baseline gap-1">
        <span className="text-[15px] font-bold text-brand-black dark:text-brand-white tabular-nums">
          {item.price}
        </span>
        <span className="text-[11px] text-brand-gray-400 dark:text-brand-gray-500 font-medium">
          EGP
        </span>
      </div>
    </div>
  );
}
