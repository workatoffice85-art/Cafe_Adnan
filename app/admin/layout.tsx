'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useLanguage } from '@/hooks/useLanguage';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Skip auth checks for login page itself
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }

      // 2. Check if in demo mode or production mode
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const isDemoMode = !supabaseUrl || supabaseUrl.includes('your-supabase-project') || supabaseUrl.includes('placeholder');

      if (isDemoMode) {
        const isDemoLoggedIn = localStorage.getItem('cafe_adnan_demo_session') === 'true';
        if (!isDemoLoggedIn) {
          router.push('/admin/login');
        } else {
          setAuthorized(true);
        }
      } else {
        // Production Supabase Auth validation
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/admin/login');
        } else {
          setAuthorized(true);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Handle Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans">
        <svg className="animate-spin h-6 w-6 text-accent mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">
          {language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Validating Credentials...'}
        </p>
      </div>
    );
  }

  // If path is login, render directly without Sidebar layout wrapping
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If authenticated, render full Sidebar + Content layout
  if (authorized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row transition-colors duration-300 font-sans">
        {/* Admin Sidebar Navigation */}
        <AdminSidebar />

        {/* Content Workspace */}
        <div className="flex-1 flex flex-col overflow-y-auto min-h-screen">
          {/* Minimal top bar for Admin */}
          <header className="h-16 border-b border-border bg-card/10 backdrop-blur-md flex items-center justify-between px-6 shrink-0 md:hidden">
            <span className="font-bold text-sm tracking-widest uppercase text-foreground">
              {t.brandName}
            </span>
          </header>
          
          <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return null;
}
