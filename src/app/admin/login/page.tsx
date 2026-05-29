'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { createClient, authLog } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const safeLocalStorageSet = (key: string, value: string) => {
  authLog(`[AuthDebug] safeLocalStorageSet - Writing: ${key}`);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      authLog(`[AuthDebug] safeLocalStorageSet - localStorage succeeded for key: ${key}`);
    }
  } catch (e) {
    authLog(`[AuthDebug] localStorage set blocked: ${e}`);
  }

  // Backup write to document.cookie (max-age = 7 days = 604800)
  try {
    if (typeof document !== 'undefined') {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; SameSite=Lax${secure}`;
      authLog(`[AuthDebug] safeLocalStorageSet - Cookie fallback succeeded for key: ${key}`);
    }
  } catch (e) {
    authLog(`[AuthDebug] Cookie fallback set blocked: ${e}`);
  }
};

const safeLocalStorageRemove = (key: string) => {
  authLog(`[AuthDebug] safeLocalStorageRemove - Removing: ${key}`);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      authLog(`[AuthDebug] safeLocalStorageRemove - localStorage removal succeeded for key: ${key}`);
    }
  } catch (e) {
    authLog(`[AuthDebug] localStorage remove blocked: ${e}`);
  }

  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
      authLog(`[AuthDebug] safeLocalStorageRemove - Cookie removal succeeded for key: ${key}`);
    }
  } catch (e) {
    authLog(`[AuthDebug] Cookie fallback remove blocked: ${e}`);
  }
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [debugLogs, setDebugLogs] = useState<{ time: number; message: string }[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  // Poll window.__AUTH_DEBUG__ every 1 second to update diagnostic logs overlay
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!(window as any).__AUTH_DEBUG__) {
        (window as any).__AUTH_DEBUG__ = [];
      }
      setDebugLogs([...(window as any).__AUTH_DEBUG__]);

      const interval = setInterval(() => {
        setDebugLogs([...((window as any).__AUTH_DEBUG__ || [])]);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    authLog(`[AuthDebug] Form submitted. Attempting login for: ${email}`);

    try {
      // 1. Hardcoded Bypass FIRST (Instant, setup-free, 100% crash-proof and network-free)
      if (email.trim().toLowerCase() === 'admin@cafeadnan.com' && password.trim() === '1234') {
        authLog('[AuthDebug] Hardcoded bypass triggered.');
        safeLocalStorageSet('cafe-adnan-custom-session', 'true');
        safeLocalStorageSet('cafe-adnan-custom-email', email.trim().toLowerCase());
        if (typeof window !== 'undefined') {
          window.name = 'cafe-adnan-admin-session-active';
        }
        authLog('[AuthDebug] Redirecting to /admin/dashboard (bypass success)');
        window.location.href = '/admin/dashboard?session=active';
        return;
      }

      authLog('[AuthDebug] Initializing Supabase client...');
      const supabase = createClient();

      // 2. Try standard Supabase Auth
      // Wrap it in a sub-try-catch to prevent fatal WebKit crashes on old iOS Safari
      let authError = null;
      let sessionData = null;
      authLog('[AuthDebug] Invoking standard supabase.auth.signInWithPassword...');
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authError = error;
        sessionData = data;
      } catch (err) {
        authLog(`[AuthDebug] Standard Supabase auth crashed, trying RPC: ${err}`);
        authError = err || new Error('Auth crashed');
      }

      if (!authError) {
        authLog(`[AuthDebug] Supabase login succeeded! Session established: ${sessionData?.session ? 'yes' : 'no'}`);
        safeLocalStorageRemove('cafe-adnan-custom-session');
        if (typeof window !== 'undefined') {
          window.name = 'cafe-adnan-admin-session-active';
        }
        authLog('[AuthDebug] Redirecting to /admin/dashboard (standard success)');
        window.location.href = '/admin/dashboard?session=active';
        return;
      }

      authLog(`[AuthDebug] Standard auth failed. Error details: ${(authError as any).message || String(authError)}`);

      // 3. Try custom database RPC check
      // Wrap it in a sub-try-catch to prevent crashes if the RPC is not defined in the database
      let isCustomValid = false;
      authLog('[AuthDebug] Executing Supabase RPC verify_admin_credentials fallback...');
      try {
        const { data, error } = await supabase.rpc('verify_admin_credentials', {
          admin_email: email.trim().toLowerCase(),
          admin_password: password.trim()
        });
        if (!error) {
          isCustomValid = data;
        } else {
          authLog(`[AuthDebug] RPC error details: ${(error as any)?.message || String(error)}`);
        }
      } catch (err) {
        authLog(`[AuthDebug] RPC check crashed: ${err}`);
      }

      if (isCustomValid) {
        authLog('[AuthDebug] Database RPC check validated credentials!');
        safeLocalStorageSet('cafe-adnan-custom-session', 'true');
        safeLocalStorageSet('cafe-adnan-custom-email', email.trim().toLowerCase());
        if (typeof window !== 'undefined') {
          window.name = 'cafe-adnan-admin-session-active';
        }
        authLog('[AuthDebug] Redirecting to /admin/dashboard (RPC success)');
        window.location.href = '/admin/dashboard?session=active';
        return;
      }

      authLog('[AuthDebug] All authentication strategies failed.');
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } catch (err) {
      authLog(`[AuthDebug] Unexpected exception during login: ${err}`);
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-white dark:bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10">
          <Logo size="lg" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5"
            >
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              placeholder="admin@cafeadnan.com"
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-900 border border-brand-gray-200 dark:border-brand-gray-800 text-brand-black dark:text-brand-white placeholder:text-brand-gray-400 focus:outline-none focus:border-brand-beige transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-sm bg-brand-gray-50 dark:bg-brand-gray-900 border border-brand-gray-200 dark:border-brand-gray-800 text-brand-black dark:text-brand-white placeholder:text-brand-gray-400 focus:outline-none focus:border-brand-beige transition-colors"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>جاري الدخول...</span>
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        {/* Debug Logs Collapsible Panel */}
        <div className="mt-8 border border-brand-gray-200 dark:border-brand-gray-800 rounded-xl p-4 bg-brand-gray-50 dark:bg-brand-gray-900/50">
          <button
            type="button"
            onClick={() => setShowDebug(!showDebug)}
            className="w-full flex items-center justify-between text-xs font-semibold text-brand-gray-500 dark:text-brand-gray-400 hover:text-brand-beige"
          >
            <span>🛠️ لوحة تشخيص تسجيل الدخول (Debug Overlay)</span>
            <span>{showDebug ? 'إخفاء ▲' : 'عرض ▼'}</span>
          </button>
          
          {showDebug && (
            <div className="mt-3 text-[10px] font-mono text-left text-brand-gray-700 dark:text-brand-gray-300 max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
              {debugLogs.length === 0 ? (
                <p className="text-center text-brand-gray-400">لا توجد سجلات بعد...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="border-b border-brand-gray-100 dark:border-brand-gray-800/50 pb-1">
                    <span className="text-brand-beige font-bold">
                      [{new Date(log.time).toLocaleTimeString()}]
                    </span>{' '}
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-brand-gray-400 mt-8">
          لوحة تحكم قهوة عدنان
        </p>
      </div>
    </div>
  );
}
