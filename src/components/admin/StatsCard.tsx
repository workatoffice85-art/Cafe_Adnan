import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
}

export function StatsCard({ icon: Icon, label, value, className }: StatsCardProps) {
  return (
    <div
      className={clsx(
        'bg-brand-white dark:bg-brand-gray-900 rounded-2xl p-5 border border-brand-gray-100 dark:border-brand-gray-800',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-brand-beige/10 flex items-center justify-center">
          <Icon size={20} className="text-brand-beige" />
        </div>
      </div>
      <p className="text-2xl font-bold text-brand-black dark:text-brand-white tabular-nums">
        {value}
      </p>
      <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 mt-1">
        {label}
      </p>
    </div>
  );
}
