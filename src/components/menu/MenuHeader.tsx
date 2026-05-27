'use client';

import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

export function MenuHeader() {
  return (
    <header className="w-full">
      <div className="max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Logo size="sm" showSubtitle={false} />
        <ThemeToggle />
      </div>
    </header>
  );
}
