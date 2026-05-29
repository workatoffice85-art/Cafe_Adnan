import { createClient as createSupabaseClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined' && !(window as any).__AUTH_DEBUG__) {
  (window as any).__AUTH_DEBUG__ = [];
}

export const authLog = (message: string | object) => {
  const text = typeof message === 'string' ? message : JSON.stringify(message);
  console.log(text);
  if (typeof window !== 'undefined') {
    if (!(window as any).__AUTH_DEBUG__) {
      (window as any).__AUTH_DEBUG__ = [];
    }
    (window as any).__AUTH_DEBUG__.push({
      time: Date.now(),
      message: text
    });
  }
};

export function canUseLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  try {
    authLog(`Cookie Size: ${document.cookie.length}`);
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const val = parts.pop()?.split(';').shift();
      return val ? decodeURIComponent(val) : null;
    }
  } catch (e) {
    authLog(`[AuthDebug] Cookie read failed: ${e}`);
  }
  return null;
};

const setCookie = (name: string, value: string): void => {
  if (typeof document === 'undefined') return;
  try {
    let cookieValue = value;
    
    // Check if we are writing the main session, compress/strip it to prevent exceeding 4KB cookie limits
    if (name === 'sb-cafe-adnan-session') {
      authLog(`Session Length: ${value.length}`);
      try {
        const parsed = JSON.parse(value);
        if (parsed && parsed.access_token && parsed.refresh_token) {
          const stripped = {
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
            expires_at: parsed.expires_at,
            expires_in: parsed.expires_in,
            token_type: parsed.token_type,
            user: parsed.user ? {
              id: parsed.user.id,
              email: parsed.user.email,
              role: parsed.user.role
            } : null
          };
          cookieValue = JSON.stringify(stripped);
          authLog(`[AuthDebug] Stripped session cookie size: Original = ${value.length} bytes, Compressed = ${cookieValue.length} bytes`);
        }
      } catch (err) {
        authLog(`[AuthDebug] Failed to parse and strip session cookie: ${err}`);
      }
    }

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    // SameSite=Lax for compatibility. 604800 seconds = 7 days.
    document.cookie = `${name}=${encodeURIComponent(cookieValue)}; path=/; max-age=604800; SameSite=Lax${secure}`;
    authLog(`Cookie Size: ${document.cookie.length}`);
  } catch (e) {
    authLog(`[AuthDebug] Cookie write failed: ${e}`);
  }
};

const eraseCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    authLog(`Cookie Size: ${document.cookie.length}`);
  } catch (e) {
    authLog(`[AuthDebug] Cookie delete failed: ${e}`);
  }
};

// In-memory fallback cache using Map (treated as temporary cache only, does not survive page reloads)
const memoryStore = new Map<string, string>();

const hybridStorageAdapter = {
  getItem: (key: string): string | null => {
    authLog(`[AuthDebug] Reading key: ${key}`);
    
    // 1. Try LocalStorage
    try {
      if (canUseLocalStorage()) {
        const val = window.localStorage.getItem(key);
        if (val) {
          authLog(`[AuthDebug] Key found in localStorage: ${key}`);
          return val;
        }
      }
    } catch (e) {
      authLog(`[AuthDebug] localStorage read exception: ${e}`);
    }

    // 2. Try Cookie fallback
    const cookieVal = getCookie(key);
    if (cookieVal) {
      authLog(`[AuthDebug] Key found in cookies: ${key}`);
      // Backfill LocalStorage if it works now
      try {
        if (canUseLocalStorage()) {
          window.localStorage.setItem(key, cookieVal);
        }
      } catch {}
      return cookieVal;
    }

    // 3. Try memory fallback (Temporary Cache Only)
    const memVal = memoryStore.get(key);
    if (memVal) {
      authLog(`[AuthDebug] Key found in memory Map cache: ${key}`);
      return memVal;
    }

    authLog(`[AuthDebug] Key not found in any store: ${key}`);
    return null;
  },

  setItem: (key: string, value: string): void => {
    authLog(`[AuthDebug] Writing key: ${key}`);
    
    // 1. Store in memory Map cache (Temporary cache)
    memoryStore.set(key, value);

    // 2. Try storing in LocalStorage
    let lsSuccess = false;
    try {
      if (canUseLocalStorage()) {
        window.localStorage.setItem(key, value);
        lsSuccess = true;
      }
    } catch (e) {
      authLog(`[AuthDebug] localStorage write exception: ${e}`);
    }

    // 3. Store in cookies as well for double protection and absolute persistence
    setCookie(key, value);
    authLog(`[AuthDebug] Write complete for key: ${key}. LocalStorage success: ${lsSuccess}`);
  },

  removeItem: (key: string): void => {
    authLog(`[AuthDebug] Removing key: ${key}`);
    
    // 1. Remove from memory Map cache
    memoryStore.delete(key);

    // 2. Try removing from LocalStorage
    try {
      if (canUseLocalStorage()) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      authLog(`[AuthDebug] localStorage remove exception: ${e}`);
    }

    // 3. Remove from cookies
    eraseCookie(key);
    authLog(`[AuthDebug] Removal complete for key: ${key}`);
  }
};

export const detectLegacyBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  const missingStorage = !canUseLocalStorage();
  const missingFetch = typeof fetch === 'undefined';
  const missingPromise = typeof Promise === 'undefined';
  
  const ua = window.navigator.userAgent;
  const isLegacyIOS = /iPhone OS (?:[0-9]|1[0-5])_/i.test(ua) || /iPad.*OS (?:[0-9]|1[0-5])_/i.test(ua);
  const isLegacySafari = /Version\/(?:[0-9]|1[0-5])\.[0-9]+(\.[0-9]+)*.*Safari/i.test(ua);

  return missingStorage || missingFetch || missingPromise || isLegacyIOS || isLegacySafari;
};

// Singleton Client instance to prevent duplicate subscriptions and multiple instantiations
let globalSupabaseClient: any = null;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build time to prevent prerendering errors
    return createSupabaseClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  }

  // Client-side Singleton client retrieval
  if (typeof window !== 'undefined' && globalSupabaseClient) {
    return globalSupabaseClient;
  }

  const isLegacy = detectLegacyBrowser();
  authLog(`[AuthDebug] Browser legacy check: ${isLegacy}`);

  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: !isLegacy,
      detectSessionInUrl: true,
      storageKey: 'sb-cafe-adnan-session',
      storage: hybridStorageAdapter,
    },
  });

  // Diagnostic listener for real-time auth states
  try {
    client.auth.onAuthStateChange((event, session) => {
      authLog({
        event,
        user: session?.user?.id,
        expires: session?.expires_at
      });
    });
  } catch (e) {
    authLog(`[AuthDebug] Failed to register onAuthStateChange listener: ${e}`);
  }

  if (typeof window !== 'undefined') {
    globalSupabaseClient = client;
  }

  return client;
}
