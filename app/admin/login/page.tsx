'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { language, t, isRtl } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDemoMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      return !supabaseUrl || supabaseUrl.includes('your-supabase-project') || supabaseUrl.includes('placeholder');
    }
    return false;
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (isDemoMode) {
        // High-fidelity mockup login simulation for client review
        if (email === 'admin@cafeadnan.com' && password === 'admin123') {
          // Set standard demo cookie/session
          localStorage.setItem('cafe_adnan_demo_session', 'true');
          router.push('/admin/dashboard');
        } else {
          setError(language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور التجريبية غير صحيحة' : 'Incorrect demo email or password');
        }
      } else {
        // Production-ready Supabase Auth
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          setError(authError.message);
        } else {
          router.push('/admin/dashboard');
        }
      }
    } catch (err) {
      setError(t.errorOccurred);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 transition-colors duration-300 relative select-none">
      
      {/* Return to public menu button */}
      <Link 
        href="/menu" 
        className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-foreground transition-colors py-2 px-3 border border-border rounded-sm hover:bg-card/40 active:scale-95`}
      >
        <ArrowLeft className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
        <span>{t.backToMenu}</span>
      </Link>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo and Greeting Header */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="scale-90" />
          <h2 className="text-lg font-bold tracking-widest uppercase text-foreground mt-3">
            {t.adminLogin}
          </h2>
          <p className="text-[10px] tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mt-1">
            {t.adminLoginSub}
          </p>
        </div>

        {/* Demo Credentials Indicator */}
        {isDemoMode && (
          <div className="mb-6 p-4 border border-[#C5A880]/30 bg-[#C5A880]/5 rounded-sm flex items-start gap-3 select-text text-xs leading-relaxed text-neutral-600 dark:text-neutral-300 font-sans">
            <ShieldAlert className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold uppercase tracking-wider text-accent text-[10px] mb-0.5">
                {language === 'ar' ? 'نظام العرض التوضيحي نشط' : 'Demo Playground Active'}
              </span>
              <p>
                {language === 'ar' 
                  ? 'لم يتم إعداد Supabase بعد. يرجى استخدام بيانات الدخول التجريبية للاختبار:' 
                  : 'Database not configured yet. Sign in using playground credentials:'}
              </p>
              <div className="mt-1 font-mono text-[11px] bg-card p-1.5 border border-border/60 rounded-sm">
                <strong>Email:</strong> admin@cafeadnan.com <br />
                <strong>Pass:</strong> admin123
              </div>
            </div>
          </div>
        )}

        {/* Login Form Box */}
        <div className="p-6 sm:p-8 border border-border bg-card/45 backdrop-blur-sm rounded-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Error Message banner */}
            {error && (
              <div className="p-3.5 text-xs text-rose-500 border border-rose-500/20 bg-rose-500/5 rounded-sm select-text font-sans font-medium">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 select-none">
                {t.emailLabel}
              </label>
              <div className="relative flex items-center">
                <span className={`absolute ${isRtl ? 'right-3' : 'left-3'} text-neutral-400 dark:text-neutral-600`}>
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cafeadnan.com"
                  className={`w-full py-3 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-sm border border-border bg-background/50 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-700 focus:border-[#C5A880]/70 focus:bg-background focus:ring-1 focus:ring-[#C5A880]/30 transition-all font-sans`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 select-none">
                {t.passwordLabel}
              </label>
              <div className="relative flex items-center">
                <span className={`absolute ${isRtl ? 'right-3' : 'left-3'} text-neutral-400 dark:text-neutral-600`}>
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full py-3 ${isRtl ? 'pr-10 pl-11' : 'pl-10 pr-11'} rounded-sm border border-border bg-background/50 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-700 focus:border-[#C5A880]/70 focus:bg-background focus:ring-1 focus:ring-[#C5A880]/30 transition-all font-sans`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRtl ? 'left-3' : 'right-3'} text-neutral-400 dark:text-neutral-600 hover:text-foreground transition-colors p-1 rounded-full`}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="accent"
              className="w-full mt-4 py-3.5 text-xs font-bold tracking-widest uppercase rounded-sm"
              isLoading={loading}
            >
              {loading ? t.loggingIn : t.loginButton}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
