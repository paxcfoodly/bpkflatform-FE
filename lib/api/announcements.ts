/**
 * BPK Hub — Announcement API Client
 * Typed fetch wrappers for /api/announcements/* endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AnnouncementListItem {
  id: string;
  title: string;
  organization: string;
  category: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  d_day: number | null;
  d_day_label: string | null;
  d_day_color: string | null;
  view_count: number;
  is_scrapped: boolean;
  collected_at: string;
  created_at: string;
}

export interface AnnouncementDetail {
  id: string;
  title: string;
  organization: string;
  category: string | null;
  content: string | null;
  source_url: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  d_day: number | null;
  d_day_label: string | null;
  d_day_color: string | null;
  view_count: number;
  is_scrapped: boolean;
  collected_at: string;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapResponse {
  is_scrapped: boolean;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success?: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface SuccessResponse<T> {
  success?: boolean;
  data: T;
  meta?: { timestamp: string };
}

export interface AnnouncementListParams {
  page?: number;
  limit?: number;
  organization?: string;
  category?: string;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ── API Error ────────────────────────────────────────────────────────────────

export class AnnouncementApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AnnouncementApiError';
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

async function announcementFetch<T>(
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
    throw new AnnouncementApiError(res.status, code, detail);
  }

  return res.json();
}

// ── API Functions ────────────────────────────────────────────────────────────

/** 공고 목록 조회 (페이지네이션, 필터, 검색, 정렬) */
export async function fetchAnnouncements(
  params: AnnouncementListParams = {},
): Promise<PaginatedResponse<AnnouncementListItem>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.organization) searchParams.set('organization', params.organization);
  if (params.category) searchParams.set('category', params.category);
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.sort_order) searchParams.set('sort_order', params.sort_order);

  const qs = searchParams.toString();
  return announcementFetch<PaginatedResponse<AnnouncementListItem>>(
    `/api/announcements${qs ? `?${qs}` : ''}`,
  );
}

/** 공고 상세 조회 */
export async function fetchAnnouncement(
  id: string,
): Promise<AnnouncementDetail> {
  const res = await announcementFetch<SuccessResponse<AnnouncementDetail>>(
    `/api/announcements/${encodeURIComponent(id)}`,
  );
  return res.data;
}

/** 공고 스크랩 토글 (JWT 필수) */
export async function toggleAnnouncementScrap(
  id: string,
): Promise<ScrapResponse> {
  const res = await announcementFetch<SuccessResponse<ScrapResponse>>(
    `/api/announcements/${encodeURIComponent(id)}/scrap`,
    { method: 'POST' },
  );
  return res.data;
}
