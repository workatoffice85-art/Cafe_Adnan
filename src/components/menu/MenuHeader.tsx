'use client';

import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

export function MenuHeader() {
  return (
    <header className="sticky top-0 z-50 bg-brand-white/95 dark:bg-brand-black/95 backdrop-blur-sm">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <Logo size="sm" showSubtitle={false} />
        <ThemeToggle />
      </div>
    </header>
  );
}
