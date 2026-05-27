'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Coffee, 
  LogOut, 
  Globe, 
  Sun, 
  Moon, 
  Menu, 
  X,
  QrCode
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    // 1. Clear session
    localStorage.removeItem('cafe_adnan_demo_session');
    
    // 2. Production signout
    await supabase.auth.signOut();
    
    // 3. Reroute
    router.push('/admin/login');
  };

  const menuItems = [
    {
      name: t.dashboard,
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t.manageItems,
      href: '/admin/items',
      icon: Coffee,
    },
    {
      name: t.manageCategories,
      href: '/admin/categories',
      icon: FolderOpen,
    }
  ];

  return (
    <>
      {/* Mobile Hamburger toggle floating button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`fixed top-4 ${isRtl ? 'left-4' : 'right-4'} z-50 p-2 border border-border bg-background rounded-sm md:hidden hover:bg-card active:scale-95 text-foreground transition-all duration-300`}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Backdrop overlay for mobile menu */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed inset-y-0 z-45 flex w-64 flex-col border-border bg-card transition-all duration-350 ease-in-out md:sticky md:translate-x-0 ${
          mobileOpen 
            ? 'translate-x-0' 
            : isRtl 
              ? 'translate-x-full md:translate-x-0 right-0' 
              : '-translate-x-full md:translate-x-0 left-0'
        } ${isRtl ? 'right-0 border-l' : 'left-0 border-r'}`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-center border-b border-border select-none gap-3 px-6">
          <Logo size="sm" className="scale-90" />
          <div className="flex flex-col items-start leading-none justify-center">
            <span className="font-bold text-sm tracking-widest uppercase text-foreground">
              {t.brandName}
            </span>
            <span className="text-[9px] tracking-wider text-accent font-semibold mt-0.5 uppercase">
              {t.adminLogin}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 text-xs font-semibold uppercase tracking-widest rounded-sm transition-all select-none active:scale-[0.99] ${
                  isActive
                    ? 'bg-[#C5A880] text-black'
                    : 'text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900/50'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="mt-0.5">{item.name}</span>
              </Link>
            );
          })}

          {/* Quick link to printable menu */}
          <Link
            href="/menu"
            target="_blank"
            className="flex items-center gap-3.5 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900/50 rounded-sm transition-all select-none"
          >
            <QrCode className="h-4 w-4 shrink-0 text-accent" />
            <span className="mt-0.5">{t.backToMenu}</span>
          </Link>
        </nav>

        {/* Footer controls & Logout */}
        <div className="border-t border-border p-4 space-y-4 bg-background/30">
          
          {/* Quick Lang & Theme buttons */}
          <div className="flex items-center justify-between gap-2 px-2">
            
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold tracking-wider rounded-sm border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 text-foreground transition-all select-none active:scale-95"
            >
              <Globe className="h-3 w-3 text-accent" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-sm border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 text-foreground transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-[#C5A880]" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-black" />
              )}
            </button>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-sm transition-all select-none active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="mt-0.5">{t.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
export default AdminSidebar;
