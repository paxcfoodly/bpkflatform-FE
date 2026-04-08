/**
 * BPK Hub — Auth API Client
 * Typed fetch wrappers for /api/auth/* endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company_name: string | null;
  role: string;
  status: string;
  email_verified: boolean;
  profile_image_url: string | null;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: TokenPair;
}

export interface SignupResponse {
  user: AuthUser;
  message: string;
}

/** BE wraps every success in { success: true, data: T, meta: {...} } */
interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta: { timestamp: string };
}

/** BE error shape */
interface ErrorEnvelope {
  success: false;
  detail?: string;          // FastAPI HTTPException
  error?: {
    code: string;
    message: string;
  };
}

export class AuthApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
  }
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function authFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  // Attach access token if available (client-side only)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bpk_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.detail ?? body.error?.message ?? res.statusText;
    const code = body.error?.code ?? `HTTP_${res.status}`;
    throw new AuthApiError(res.status, code, detail);
  }

  const json: SuccessEnvelope<T> = await res.json();
  return json.data;
}

// ── API Functions ────────────────────────────────────────────────────────────

export async function signup(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company_name?: string;
  business_number?: string;
}): Promise<SignupResponse> {
  return authFetch<SignupResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  return authFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  return authFetch<{ message: string }>(
    `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
  );
}

export async function refreshTokens(
  refresh_token: string,
): Promise<TokenPair> {
  return authFetch<TokenPair>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token }),
  });
}

export async function logout(): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(data: {
  token: string;
  new_password: string;
}): Promise<{ message: string }> {
  return authFetch<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<AuthUser> {
  return authFetch<AuthUser>('/api/auth/me');
}
