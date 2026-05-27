'use client';

import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { Logo } from './Logo';
import { Sun, Moon, Globe, Coffee } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isAdmin = false }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo and Title */}
        <Link 
          href={isAdmin ? "/admin/dashboard" : "/menu"} 
          className="flex items-center gap-3 active:scale-98 transition-transform select-none"
        >
          <Logo size="sm" className="scale-90" />
          <div className="flex flex-col items-start leading-none justify-center">
            <span className="font-bold text-sm sm:text-base tracking-widest uppercase text-foreground">
              {t.brandName}
            </span>
            <span className="text-[10px] tracking-wider text-accent font-medium mt-0.5">
              {isAdmin ? t.dashboard : t.brandSub}
            </span>
          </div>
        </Link>

        {/* Action Controls (Theme, Language, and Staff Login Link if not Admin) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-sm border border-border hover:bg-card text-foreground transition-all duration-200 select-none active:scale-95"
            title={language === 'ar' ? 'Switch to English' : 'تحويل للعربية'}
          >
            <Globe className="h-3.5 w-3.5 text-accent" />
            <span className="mt-0.5">{language === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-sm border border-border hover:bg-card text-foreground transition-all duration-200 active:scale-95"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Activate Light Mode' : 'تفعيل الوضع الداكن'}
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-[#C5A880]" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-[#111111]" />
            )}
          </button>

          {/* Admin link helper for public menu */}
          {!isAdmin && (
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-sm border border-border hover:bg-card text-foreground transition-all duration-200 active:scale-95 flex items-center justify-center"
              title="Admin Portal"
            >
              <Coffee className="h-3.5 w-3.5 text-accent" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
