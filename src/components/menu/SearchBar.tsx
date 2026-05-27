'use client';

import { Search, X } from 'lucide-react';
import clsx from 'clsx';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchBar({ value, onChange, className }: SearchBarProps) {
  return (
    <div className={clsx('relative', className)}>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
        <Search size={18} className="text-brand-gray-400" />
      </div>
      <input
        id="menu-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ابحث في القائمة... | Search menu..."
        className={clsx(
          'w-full pr-10 pl-10 py-3 rounded-xl text-sm',
          'bg-brand-gray-50 dark:bg-brand-gray-900',
          'border border-brand-gray-200 dark:border-brand-gray-800',
          'text-brand-black dark:text-brand-white',
          'placeholder:text-brand-gray-400 dark:placeholder:text-brand-gray-600',
          'focus:outline-none focus:border-brand-beige dark:focus:border-brand-beige',
          'transition-colors duration-200'
        )}
        dir="rtl"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-brand-gray-300"
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
