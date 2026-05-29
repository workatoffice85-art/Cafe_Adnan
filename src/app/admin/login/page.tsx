'use client';

import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const safeLocalStorageSet = (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn('localStorage is blocked for writing:', e);
  }

  // Fallback: Write to document.cookie if localStorage is strictly blocked
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${key}=${value}; path=/; max-age=86400; SameSite=Lax`;
    }
  } catch (e) {
    console.warn('Cookie write blocked:', e);
  }
};

const safeLocalStorageRemove = (key: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('localStorage is blocked for removing:', e);
  }

  // Fallback: Remove from document.cookie if localStorage is strictly blocked
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch (e) {
    console.warn('Cookie remove blocked:', e);
  }
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Hardcoded Bypass FIRST (Instant, setup-free, 100% crash-proof and network-free)
      if (email.trim().toLowerCase() === 'admin@cafeadnan.com' && password.trim() === '1234') {
        safeLocalStorageSet('cafe-adnan-custom-session', 'true');
        safeLocalStorageSet('cafe-adnan-custom-email', email.trim().toLowerCase());
        if (typeof window !== 'undefined') {
          window.name = 'cafe-adnan-admin-session-active';
        }
        window.location.href = '/admin/dashboard?session=active';
        return;
      }

      const supabase = createClient();

      // 2. Try standard Supabase Auth
      // Wrap it in a sub-try-catch to prevent fatal WebKit crashes on old iOS Safari
      let authError = null;
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authError = error;
      } catch (err) {
        console.warn('Standard Supabase auth crashed, trying RPC:', err);
        authError = err || new Error('Auth crashed');
      }

      if (!authError) {
        safeLocalStorageRemove('cafe-adnan-custom-session');
        if (typeof window !== 'undefined') {
          window.name = 'cafe-adnan-admin-session-active';
        }
        window.location.href = '/admin/dashboard?session=active';
        return;
      }

      // 3. Try custom database RPC check
      // Wrap it in a sub-try-catch to prevent crashes if the RPC is not defined in the database
      let isCustomValid = false;
      try {
        const { data, error } = await supabase.rpc('verify_admin_credentials', {
          admin_email: email.trim().toLowerCase(),
          admin_password: password.trim()
        });
        if (!error) {
          isCustomValid = data;
        }
      } catch (err) {
        console.warn('RPC check crashed, skipping:', err);
      }

      if (isCustomValid) {
        safeLocalStorageSet('cafe-adnan-custom-session', 'true');
        safeLocalStorageSet('cafe-adnan-custom-email', email.trim().toLowerCase());
        if (typeof window !== 'undefined') {
          window.name = 'cafe-adnan-admin-session-active';
        }
        window.location.href = '/admin/dashboard?session=active';
        return;
      }

      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } catch {
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

        {/* Footer */}
        <p className="text-center text-xs text-brand-gray-400 mt-8">
          لوحة تحكم قهوة عدنان
        </p>
      </div>
    </div>
  );
}
