import { Coffee } from 'lucide-react';
import clsx from 'clsx';

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="w-16 h-16 rounded-full bg-brand-gray-100 dark:bg-brand-gray-800 flex items-center justify-center mb-4">
        <Coffee size={28} className="text-brand-beige" />
      </div>
      <h3 className="text-lg font-semibold text-brand-gray-700 dark:text-brand-gray-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 text-center max-w-xs">
          {description}
        </p>
      )}
    </div>
  );
}
