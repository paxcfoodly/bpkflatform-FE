/**
 * BPK Hub — Auth Store (Zustand)
 * Manages login state, token persistence, and silent refresh.
 */
import { create } from 'zustand';
import type { AuthUser, TokenPair } from '@/lib/api/auth';
import * as authApi from '@/lib/api/auth';

interface AuthState {
  /** Current user, null when logged out */
  user: AuthUser | null;
  /** Whether the initial auth check (hydration) has completed */
  hydrated: boolean;
  /** Loading flag for auth actions */
  loading: boolean;

  // ── Actions ──────────────────────────────────────────────────────
  setUser: (user: AuthUser | null) => void;
  /** Persist tokens to localStorage and set user */
  loginSuccess: (user: AuthUser, tokens: TokenPair) => void;
  /** Clear tokens and user */
  logoutAction: () => Promise<void>;
  /** Hydrate from stored tokens on mount */
  hydrate: () => Promise<void>;
  /** Silent token refresh */
  refreshSession: () => Promise<boolean>;
}

function persistTokens(tokens: TokenPair) {
  localStorage.setItem('bpk_access_token', tokens.access_token);
  localStorage.setItem('bpk_refresh_token', tokens.refresh_token);
  // middleware.ts에서 서버사이드 라우트 보호에 사용하는 인증 쿠키
  document.cookie = 'bpk_authenticated=1; path=/; max-age=1209600; SameSite=Lax';
}

function clearTokens() {
  localStorage.removeItem('bpk_access_token');
  localStorage.removeItem('bpk_refresh_token');
  document.cookie = 'bpk_authenticated=; path=/; max-age=0';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  loading: false,

  setUser: (user) => set({ user }),

  loginSuccess: (user, tokens) => {
    persistTokens(tokens);
    set({ user });
  },

  logoutAction: async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — ignore network errors on logout
    }
    clearTokens();
    set({ user: null });
  },

  hydrate: async () => {
    if (typeof window === 'undefined') {
      set({ hydrated: true });
      return;
    }

    const accessToken = localStorage.getItem('bpk_access_token');
    if (!accessToken) {
      set({ hydrated: true });
      return;
    }

    set({ loading: true });
    try {
      const user = await authApi.getMe();
      set({ user, hydrated: true, loading: false });
    } catch {
      // Token expired — try refresh
      const refreshed = await get().refreshSession();
      if (refreshed) {
        try {
          const user = await authApi.getMe();
          set({ user, hydrated: true, loading: false });
          return;
        } catch {
          // still failed
        }
      }
      clearTokens();
      set({ user: null, hydrated: true, loading: false });
    }
  },

  refreshSession: async () => {
    const rt = localStorage.getItem('bpk_refresh_token');
    if (!rt) return false;

    try {
      const tokens = await authApi.refreshTokens(rt);
      persistTokens(tokens);
      return true;
    } catch {
      clearTokens();
      set({ user: null });
      return false;
    }
  },
}));
