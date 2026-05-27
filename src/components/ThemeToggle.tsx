'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import clsx from 'clsx';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      className={clsx(
        'p-2.5 rounded-full transition-colors duration-200',
        'hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800',
        'text-brand-gray-600 dark:text-brand-gray-400',
        'active:scale-95',
        className
      )}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
