/**
 * BPK Hub — HACCP Certification API Client
 * Typed fetch wrappers for /api/haccp/* endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface HaccpInstitution {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  region: string | null;
  category: string | null;
  is_active: boolean;
}

export interface HaccpInstitutionDetail {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  region: string | null;
  category: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegionOption {
  region: string;
  count: number;
}

export interface InstitutionListParams {
  page?: number;
  limit?: number;
  region?: string;
  category?: string;
  search?: string;
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

// ── API Error ────────────────────────────────────────────────────────────────

export class HaccpApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'HaccpApiError';
    this.status = status;
    this.code = code;
  }
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function haccpFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.detail ?? body.error?.message ?? res.statusText;
    const code = body.error?.code ?? `HTTP_${res.status}`;
    throw new HaccpApiError(res.status, code, detail);
  }

  return res.json();
}

// ── API Functions ────────────────────────────────────────────────────────────

/** HACCP 인증기관 목록 조회 (페이지네이션, 필터, 검색) */
export async function fetchInstitutions(
  params: InstitutionListParams = {},
): Promise<PaginatedResponse<HaccpInstitution>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.region) searchParams.set('region', params.region);
  if (params.category) searchParams.set('category', params.category);
  if (params.search) searchParams.set('search', params.search);

  const qs = searchParams.toString();
  return haccpFetch<PaginatedResponse<HaccpInstitution>>(
    `/api/haccp/institutions${qs ? `?${qs}` : ''}`,
  );
}

/** HACCP 인증기관 상세 조회 */
export async function fetchInstitution(
  id: string,
): Promise<HaccpInstitutionDetail> {
  const res = await haccpFetch<SuccessResponse<HaccpInstitutionDetail>>(
    `/api/haccp/institutions/${encodeURIComponent(id)}`,
  );
  return res.data;
}

/** HACCP 인증기관 지역 필터 옵션 */
export async function fetchRegions(): Promise<RegionOption[]> {
  const res = await haccpFetch<SuccessResponse<RegionOption[]>>(
    `/api/haccp/regions`,
  );
  return res.data;
}

// ── HACCP 인증업체 검색 (공공 API) ──────────────────────────────────────────

export interface HaccpCompany {
  cert_no: string;
  food_type: string;
  company: string;
  biz_no: string;
  ceo_name: string;
  address: string;
  sido: string;
  sigungu: string;
  uptae_name: string;
  upjong_name: string;
  type_name: string;
  cert_date: string;
  cert_end_date: string;
}

export interface CompanySearchParams {
  company?: string;
  sido?: string;
  page?: number;
  limit?: number;
}

export interface CompanySearchResponse {
  success: boolean;
  data: HaccpCompany[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** HACCP 인증업체 검색 (공공데이터포털 API) */
export async function searchHaccpCompanies(
  params: CompanySearchParams = {},
): Promise<CompanySearchResponse> {
  const searchParams = new URLSearchParams();

  if (params.company) searchParams.set('company', params.company);
  if (params.sido) searchParams.set('sido', params.sido);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  return haccpFetch<CompanySearchResponse>(
    `/api/haccp/companies${qs ? `?${qs}` : ''}`,
  );
}
