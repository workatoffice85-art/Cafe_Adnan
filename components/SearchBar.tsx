'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const { t, isRtl } = useLanguage();

  return (
    <div className="relative w-full max-w-xl mx-auto my-6 px-4 sm:px-0">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className={`absolute ${isRtl ? 'right-7' : 'left-3'} pointer-events-none text-neutral-400 dark:text-neutral-600 transition-colors`}>
          <Search className="h-4 w-4" />
        </div>

        {/* TextInput */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className={`w-full py-3.5 ${isRtl ? 'pr-11 pl-10' : 'pl-10 pr-10'} rounded-sm border border-border bg-card/50 text-foreground text-sm tracking-wider outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-[#C5A880]/70 focus:bg-card focus:ring-1 focus:ring-[#C5A880]/30 transition-all duration-300 font-sans`}
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={() => onChange('')}
            className={`absolute ${isRtl ? 'left-7' : 'right-3'} text-neutral-400 dark:text-neutral-600 hover:text-foreground transition-colors p-1 rounded-full`}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
export default SearchBar;
