/**
 * BPK Hub — News API Client
 * Typed fetch wrappers for /api/news/* endpoints.
 */

import type { PaginatedResponse, PaginationMeta, SuccessResponse } from './announcements';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export type { PaginatedResponse, PaginationMeta };

export interface NewsListItem {
  id: string;
  type: string;           // "NEWS" | "NOTICE"
  title: string;
  summary: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  is_pinned: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

export interface NewsDetail {
  id: string;
  type: string;
  title: string;
  content: string;
  summary: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  is_pinned: boolean;
  author_id: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsListParams {
  page?: number;
  limit?: number;
  type?: string;          // "NEWS" | "NOTICE"
  search?: string;
}

// ── API Error ────────────────────────────────────────────────────────────────

export class NewsApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'NewsApiError';
    this.status = status;
    this.code = code;
  }
}

// ── Helper ───────────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bpk_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function newsFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.detail ?? body.error?.message ?? res.statusText;
    const code = body.error?.code ?? `HTTP_${res.status}`;
    throw new NewsApiError(res.status, code, detail);
  }

  return res.json();
}

// ── API Functions ────────────────────────────────────────────────────────────

/** 뉴스 목록 조회 (페이지네이션, 유형 필터, 검색) */
export async function fetchNewsList(
  params: NewsListParams = {},
): Promise<PaginatedResponse<NewsListItem>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.type) searchParams.set('type', params.type);
  if (params.search) searchParams.set('search', params.search);

  const qs = searchParams.toString();
  return newsFetch<PaginatedResponse<NewsListItem>>(
    `/api/news${qs ? `?${qs}` : ''}`,
  );
}

/** 뉴스 상세 조회 */
export async function fetchNewsDetail(
  id: string,
): Promise<NewsDetail> {
  const res = await newsFetch<SuccessResponse<NewsDetail>>(
    `/api/news/${encodeURIComponent(id)}`,
  );
  return res.data;
}
