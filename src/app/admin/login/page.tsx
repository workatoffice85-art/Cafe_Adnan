'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
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
