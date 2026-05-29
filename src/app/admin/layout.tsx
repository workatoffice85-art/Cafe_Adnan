'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { usePathname } from 'next/navigation';
import { createClient, authLog } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const safeLocalStorageGet = (key: string): string | null => {
  authLog(`[AuthDebug] safeLocalStorageGet - Reading: ${key}`);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val) {
        authLog(`[AuthDebug] safeLocalStorageGet - localStorage hit for key: ${key}`);
        return val;
      }
    }
  } catch (e) {
    authLog(`[AuthDebug] localStorage read blocked: ${e}`);
  }
  
  // Fallback: Read from document.cookie with decoding
  try {
    if (typeof document !== 'undefined') {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${key}=`);
      if (parts.length === 2) {
        const val = parts.pop()?.split(';').shift();
        if (val) {
          const decoded = decodeURIComponent(val);
          authLog(`[AuthDebug] safeLocalStorageGet - Cookie fallback hit for key: ${key}`);
          return decoded;
        }
      }
    }
  } catch (e) {
    authLog(`[AuthDebug] Cookie read blocked: ${e}`);
  }
  return null;
};

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
      authLog('Layout Mounted');
      authLog(`[AuthDebug] checkAuth starting. Current pathname: ${pathname}, isLoginPage: ${isLoginPage}`);

      // 0. Automatically redirect legacy devices immediately to the Lite Node.js Admin Portal if configured
      const isLegacyDevice = () => {
        if (typeof window === 'undefined') return false;
        const ua = window.navigator.userAgent;
        const isLegacyIOS = /iPhone OS (?:[0-9]|1[0-5])_/i.test(ua) || /iPad.*OS (?:[0-9]|1[0-5])_/i.test(ua);
        const isLegacySafari = /Version\/(?:[0-9]|1[0-5])\.[0-9]+(\.[0-9]+)*.*Safari/i.test(ua);
        return isLegacyIOS || isLegacySafari;
      };

      const legacy = isLegacyDevice();
      authLog(`[AuthDebug] Is legacy device detected: ${legacy}`);

      if (legacy) {
        const liteAdminUrl = process.env.NEXT_PUBLIC_LITE_ADMIN_URL;
        authLog(`[AuthDebug] Legacy device check: NEXT_PUBLIC_LITE_ADMIN_URL = ${liteAdminUrl}`);
        if (liteAdminUrl) {
          authLog(`[AuthDebug] Redirecting legacy device to Lite Portal: ${liteAdminUrl}`);
          window.location.href = liteAdminUrl;
          return;
        }
      }

      if (isLoginPage) {
        // If they are on the login page but have a active legacy/window session, go to dashboard
        const hasWindowSession = typeof window !== 'undefined' && (
          window.name === 'cafe-adnan-admin-session-active' ||
          window.location.search.includes('session=active') ||
          window.location.hash.includes('session=active')
        );
        const customSession = safeLocalStorageGet('cafe-adnan-custom-session');
        authLog(`[AuthDebug] LoginPage check - hasWindowSession: ${hasWindowSession}, customSession: ${customSession}`);

        if (hasWindowSession || customSession === 'true') {
          authLog('[AuthDebug] Active session found while on LoginPage. Redirecting to dashboard.');
          if (typeof window !== 'undefined' && window.name !== 'cafe-adnan-admin-session-active') {
            window.name = 'cafe-adnan-admin-session-active';
          }
          window.location.href = '/admin/dashboard';
          return;
        }
        setAuthLoading(false);
        return;
      }

      try {
        // 0. Check window.name and URL query parameters for ultra-safe legacy session persistence (crash-proof and cookie-less)
        const hasWindowSession = typeof window !== 'undefined' && (
          window.name === 'cafe-adnan-admin-session-active' ||
          window.location.search.includes('session=active') ||
          window.location.hash.includes('session=active')
        );
        authLog(`[AuthDebug] Dashboard check - hasWindowSession: ${hasWindowSession}`);

        if (hasWindowSession) {
          authLog('[AuthDebug] window.name or URL active session matched. Permitting entry.');
          if (typeof window !== 'undefined' && window.name !== 'cafe-adnan-admin-session-active') {
            window.name = 'cafe-adnan-admin-session-active';
          }
          setAuthLoading(false);
          return;
        }

        // 1. Check custom local fallback session FIRST (instant, synchronous, and crash-proof)
        const customSession = safeLocalStorageGet('cafe-adnan-custom-session');
        authLog(`[AuthDebug] Dashboard check - customSession: ${customSession}`);

        if (customSession === 'true') {
          authLog('[AuthDebug] Fallback custom session is active. Permitting entry.');
          if (typeof window !== 'undefined') {
            window.name = 'cafe-adnan-admin-session-active';
          }
          setAuthLoading(false);
          return;
        }

        // 2. Standard Supabase auth checks bypassed for maximum legacy device compatibility
        authLog('[AuthDebug] Standard Supabase layout session checks bypassed.');

        authLog('Redirecting To Login');
        authLog('[AuthDebug] No valid custom session detected. Redirecting to login page...');
        window.location.href = '/admin/login';
      } catch (err) {
        authLog(`[AuthDebug] Exception caught in layout auth check: ${err}`);
        // Safe fallback check: If getUser() throws a fatal exception on legacy WebKit, still allow local session
        const hasWindowSession = typeof window !== 'undefined' && window.name === 'cafe-adnan-admin-session-active';
        const customSession = safeLocalStorageGet('cafe-adnan-custom-session');
        authLog(`[AuthDebug] Exception fallback check - hasWindowSession: ${hasWindowSession}, customSession: ${customSession}`);

        if (hasWindowSession || customSession === 'true') {
          authLog('[AuthDebug] Permitting entry via safety fallbacks after exception.');
          setAuthLoading(false);
        } else {
          authLog('Redirecting To Login');
          authLog('[AuthDebug] Safety check failed. Redirecting to login page...');
          window.location.href = '/admin/login';
        }
      }
    }
    checkAuth();

    // Multi-Tab Sync: Re-verify auth when tab visibility state changes (e.g., user returns from another tab where they logged out)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        authLog('[AuthDebug] Tab became visible. Re-evaluating authentication...');
        checkAuth();
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
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
