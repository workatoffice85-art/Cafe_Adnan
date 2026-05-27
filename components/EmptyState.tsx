'use client';

import React from 'react';
import { Coffee, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface EmptyStateProps {
  message?: string;
  type?: 'search' | 'menu';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  type = 'search' 
}) => {
  const { t } = useLanguage();

  const defaultMessage = type === 'search' ? t.noItemsFound : 'No items added yet.';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center border border-border mb-4">
        {type === 'search' ? (
          <Search className="h-6 w-6 text-neutral-400 dark:text-neutral-600" />
        ) : (
          <Coffee className="h-6 w-6 text-accent" />
        )}
      </div>
      <p className="text-sm font-semibold tracking-wider text-neutral-500 dark:text-neutral-400 max-w-xs font-sans">
        {message || defaultMessage}
      </p>
    </div>
  );
};
export default EmptyState;
