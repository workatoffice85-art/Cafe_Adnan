'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    async function checkAuth() {
      if (isLoginPage) {
        setAuthLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/admin/login';
        } else {
          setAuthLoading(false);
        }
      } catch {
        window.location.href = '/admin/login';
      }
    }
    checkAuth();
  }, [isLoginPage]);

  if (authLoading && !isLoginPage) {
    return (
      <div className="min-h-screen bg-brand-white dark:bg-brand-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 dark:bg-brand-black flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:mr-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-brand-white/95 dark:bg-brand-gray-900/95 backdrop-blur-sm border-b border-brand-gray-100 dark:border-brand-gray-800 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              id="admin-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800"
              aria-label="Open menu"
            >
              <Menu size={22} className="text-brand-gray-700 dark:text-brand-gray-300" />
            </button>
            <span className="text-sm font-semibold text-brand-black dark:text-brand-white">
              لوحة التحكم
            </span>
            <div className="w-10" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
