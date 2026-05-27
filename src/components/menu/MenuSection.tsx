import type { CategoryWithItems } from '@/types/database';
import { MenuItem } from './MenuItem';

interface MenuSectionProps {
  section: CategoryWithItems;
}

export function MenuSection({ section }: MenuSectionProps) {
  if (section.menu_items.length === 0) return null;

  return (
    <section id={`category-${section.id}`} className="scroll-mt-[120px]">
      {/* Category Header */}
      <div className="mb-2 pt-6 pb-2">
        <h2 className="text-xl font-bold text-brand-black dark:text-brand-white">
          {section.name_ar}
        </h2>
        <p className="text-xs text-brand-gray-400 dark:text-brand-gray-500 font-medium tracking-wide mt-0.5">
          {section.name_en}
        </p>
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0.5">
        {section.menu_items.map((item) => (
          <div
            key={item.id}
            className="border-b border-brand-gray-100/70 dark:border-brand-gray-800/40 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <MenuItem item={item} />
          </div>
        ))}
      </div>

      {/* Section Separator */}
      <div className="mt-6 border-b border-brand-gray-100 dark:border-brand-gray-800" />
    </section>
  );
}
