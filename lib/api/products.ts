/**
 * BPK Hub — Product API Client
 * Typed fetch wrappers for /api/products/* endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  product_count: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  thumbnail_url: string | null;
  status: string;
  category_id: string;
  category_name: string | null;
  price: number | null;
  price_label: string | null;
  view_count: number;
  created_at: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string;
  thumbnail_url: string | null;
  status: string;
  category: ProductCategory;
  specs: Record<string, string> | null;
  video_url: string | null;
  price: number | null;
  price_label: string | null;
  ai_keywords: string[] | null;
  view_count: number;
  sort_order: number;
  author_id: string;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  meta: { timestamp: string };
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  category_id?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ── API Error ────────────────────────────────────────────────────────────────

export class ProductApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ProductApiError';
    this.status = status;
    this.code = code;
  }
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function productFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.detail ?? body.error?.message ?? res.statusText;
    const code = body.error?.code ?? `HTTP_${res.status}`;
    throw new ProductApiError(res.status, code, detail);
  }

  return res.json();
}

// ── API Functions ────────────────────────────────────────────────────────────

/** 제품 목록 조회 (페이지네이션, 필터, 검색, 정렬) */
export async function fetchProducts(
  params: ProductListParams = {},
): Promise<PaginatedResponse<ProductListItem>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.category_id) searchParams.set('category_id', params.category_id);
  if (params.search) searchParams.set('search', params.search);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.sort_order) searchParams.set('sort_order', params.sort_order);

  const qs = searchParams.toString();
  return productFetch<PaginatedResponse<ProductListItem>>(
    `/api/products${qs ? `?${qs}` : ''}`,
  );
}

/** 제품 상세 조회 */
export async function fetchProduct(id: string): Promise<ProductDetail> {
  const res = await productFetch<SuccessResponse<ProductDetail>>(
    `/api/products/${encodeURIComponent(id)}`,
  );
  return res.data;
}

/** 카테고리 목록 조회 */
export async function fetchCategories(): Promise<ProductCategory[]> {
  const res = await productFetch<SuccessResponse<ProductCategory[]>>(
    '/api/products/categories',
  );
  return res.data;
}
