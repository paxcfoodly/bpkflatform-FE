/**
 * BPK Hub — Admin API Client
 * Typed fetch wrappers for /api/admin/* endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types (mirrors BE DashboardSummary schema) ───────────────────────────────

export interface RecentInquiryItem {
  id: string;
  company_name: string | null;
  inquiry_type: string;
  status: string;
  created_at: string;
}

export interface DashboardSummary {
  users_count: number;
  inquiries_count: number;
  products_count: number;
  posts_count: number;
  today_views: number;
  recent_inquiries: RecentInquiryItem[];
}

/** BE wraps every success in { success: true, data: T, meta: {...} } */
interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta: { timestamp: string };
}

export class AdminApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.code = code;
  }
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  // Attach access token (client-side only)
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
    throw new AdminApiError(res.status, code, detail);
  }

  const json: SuccessEnvelope<T> = await res.json();
  return json.data;
}

// ── Product Admin Types ──────────────────────────────────────────────────────

export interface AdminProductListItem {
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

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string;
  thumbnail_url: string | null;
  status: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    sort_order: number;
  };
  specs: Record<string, string> | null;
  video_url: string | null;
  price: number | null;
  price_label: string | null;
  ai_keywords: string[] | null;
  view_count: number;
  sort_order: number;
  author_id: string;
  images: { id: string; url: string; alt_text: string | null; sort_order: number }[];
  created_at: string;
  updated_at: string;
}

export interface AdminProductListParams {
  page?: number;
  limit?: number;
  category_id?: string;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedAdminResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    timestamp: string;
  };
}

export interface ProductCreateData {
  category_id: string;
  name: string;
  slug: string;
  subtitle?: string;
  description: string;
  thumbnail_url?: string;
  status?: string;
  price?: number;
  price_label?: string;
}

export interface ProductUpdateData {
  category_id?: string;
  name?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  thumbnail_url?: string;
  status?: string;
  price?: number;
  price_label?: string;
}

// ── API Functions ────────────────────────────────────────────────────────────

/** 관리자 대시보드 통계 조회 */
export async function fetchDashboard(): Promise<DashboardSummary> {
  return adminFetch<DashboardSummary>('/api/admin/dashboard');
}

// ── Product Admin API Functions ─────────────────────────────────────────────

/** 관리자 제품 목록 조회 (모든 상태) */
export async function fetchAdminProducts(
  params: AdminProductListParams = {},
): Promise<PaginatedAdminResponse<AdminProductListItem>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.category_id) searchParams.set('category_id', params.category_id);
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.sort_order) searchParams.set('sort_order', params.sort_order);

  const qs = searchParams.toString();
  const url = `${API_BASE}/api/admin/products${qs ? `?${qs}` : ''}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bpk_access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(res.status, body.error?.code ?? `HTTP_${res.status}`, body.detail ?? res.statusText);
  }
  return res.json();
}

/** 관리자 제품 상세 조회 */
export async function fetchAdminProduct(id: string): Promise<AdminProductDetail> {
  return adminFetch<AdminProductDetail>(`/api/products/${encodeURIComponent(id)}`);
}

/** 제품 등록 (관리자) */
export async function createProduct(data: ProductCreateData): Promise<AdminProductDetail> {
  return adminFetch<AdminProductDetail>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 제품 수정 (관리자) */
export async function updateProduct(id: string, data: ProductUpdateData): Promise<AdminProductDetail> {
  return adminFetch<AdminProductDetail>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** 제품 삭제 (관리자) */
export async function deleteProduct(id: string): Promise<void> {
  await adminFetch<{ message: string }>(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ── Announcement Admin Types ────────────────────────────────────────────────

export interface AdminAnnouncementListItem {
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

export interface AdminAnnouncementDetail {
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

export interface AdminAnnouncementListParams {
  page?: number;
  limit?: number;
  organization?: string;
  category?: string;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface AnnouncementCreateData {
  title: string;
  source_url: string;
  organization: string;
  category?: string;
  content?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface AnnouncementUpdateData {
  title?: string;
  organization?: string;
  category?: string;
  content?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface CollectionStats {
  inserted: number;
  skipped: number;
  updated: number;
  errors: number;
}

// ── Announcement Admin API Functions ────────────────────────────────────────

/** 공고 목록 조회 (public API, admin에서도 사용) */
export async function fetchAdminAnnouncements(
  params: AdminAnnouncementListParams = {},
): Promise<PaginatedAdminResponse<AdminAnnouncementListItem>> {
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
  const url = `${API_BASE}/api/announcements${qs ? `?${qs}` : ''}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bpk_access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(res.status, body.error?.code ?? `HTTP_${res.status}`, body.detail ?? res.statusText);
  }
  return res.json();
}

/** 공고 상세 조회 (public API) */
export async function fetchAdminAnnouncement(id: string): Promise<AdminAnnouncementDetail> {
  return adminFetch<AdminAnnouncementDetail>(`/api/announcements/${encodeURIComponent(id)}`);
}

/** 공고 등록 (관리자) */
export async function createAnnouncement(data: AnnouncementCreateData): Promise<AdminAnnouncementDetail> {
  return adminFetch<AdminAnnouncementDetail>('/api/admin/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 공고 수정 (관리자) */
export async function updateAnnouncement(id: string, data: AnnouncementUpdateData): Promise<AdminAnnouncementDetail> {
  return adminFetch<AdminAnnouncementDetail>(`/api/admin/announcements/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** 공고 삭제 (관리자) */
export async function deleteAnnouncement(id: string): Promise<void> {
  await adminFetch<{ message: string }>(`/api/admin/announcements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/** 공고 수집 트리거 (관리자) */
export async function triggerAnnouncementCollection(): Promise<CollectionStats> {
  return adminFetch<CollectionStats>('/api/admin/announcements/collect', {
    method: 'POST',
  });
}

// ── Inquiry Admin Types ─────────────────────────────────────────────────────

export interface AdminInquiryListItem {
  id: string;
  type: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  product_id: string | null;
  title: string;
  created_at: string;
  processed_at: string | null;
}

export interface AdminInquiryDetail {
  id: string;
  type: string;
  status: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  product_id: string | null;
  title: string;
  content: string;
  privacy_agreed: boolean;
  equipment_model: string | null;
  purchase_date: string | null;
  admin_note: string | null;
  processed_at: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminInquiryListParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

// ── Inquiry Admin API Functions ─────────────────────────────────────────────

/** 관리자 문의 목록 조회 */
export async function fetchAdminInquiries(
  params: AdminInquiryListParams = {},
): Promise<PaginatedAdminResponse<AdminInquiryListItem>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.type) searchParams.set('type', params.type);
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);

  const qs = searchParams.toString();
  const url = `${API_BASE}/api/admin/inquiries${qs ? `?${qs}` : ''}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bpk_access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(res.status, body.error?.code ?? `HTTP_${res.status}`, body.detail ?? res.statusText);
  }
  return res.json();
}

/** 관리자 문의 상세 조회 */
export async function fetchAdminInquiry(id: string): Promise<AdminInquiryDetail> {
  return adminFetch<AdminInquiryDetail>(`/api/admin/inquiries/${encodeURIComponent(id)}`);
}

/** 관리자 문의 상태 변경 */
export async function updateInquiryStatus(
  id: string,
  status: string,
  adminNote?: string,
): Promise<AdminInquiryDetail> {
  return adminFetch<AdminInquiryDetail>(`/api/admin/inquiries/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, admin_note: adminNote }),
  });
}

// ── News Admin Types ────────────────────────────────────────────────────────

export interface AdminNewsListItem {
  id: string;
  type: string;
  title: string;
  summary: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  is_pinned: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

export interface AdminNewsDetail {
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

export interface AdminNewsListParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
}

export interface NewsCreateData {
  type: string;
  title: string;
  content: string;
  summary?: string;
  thumbnail_url?: string;
  is_published?: boolean;
  is_pinned?: boolean;
}

export interface NewsUpdateData {
  type?: string;
  title?: string;
  content?: string;
  summary?: string;
  thumbnail_url?: string;
  is_published?: boolean;
  is_pinned?: boolean;
}

// ── News Admin API Functions ────────────────────────────────────────────────

/** 관리자 뉴스·공지 목록 조회 (미발행 포함) */
export async function fetchAdminNews(
  params: AdminNewsListParams = {},
): Promise<PaginatedAdminResponse<AdminNewsListItem>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.type) searchParams.set('type', params.type);
  if (params.search) searchParams.set('search', params.search);

  const qs = searchParams.toString();
  const url = `${API_BASE}/api/admin/news${qs ? `?${qs}` : ''}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bpk_access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(res.status, body.error?.code ?? `HTTP_${res.status}`, body.detail ?? res.statusText);
  }
  return res.json();
}

/** 관리자 뉴스·공지 상세 조회 */
export async function fetchAdminNewsItem(id: string): Promise<AdminNewsDetail> {
  return adminFetch<AdminNewsDetail>(`/api/news/${encodeURIComponent(id)}`);
}

/** 뉴스·공지 등록 (관리자) */
export async function createNews(data: NewsCreateData): Promise<AdminNewsDetail> {
  return adminFetch<AdminNewsDetail>('/api/admin/news', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 뉴스·공지 수정 (관리자) */
export async function updateNews(id: string, data: NewsUpdateData): Promise<AdminNewsDetail> {
  return adminFetch<AdminNewsDetail>(`/api/admin/news/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** 뉴스·공지 삭제 (관리자) */
export async function deleteNews(id: string): Promise<void> {
  await adminFetch<{ message: string }>(`/api/admin/news/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}


// ── User Admin Types & API ───────────────────────────────────────────────────

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  company_name: string | null;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export async function fetchAdminUsers(
  params: AdminUserListParams = {},
): Promise<{ data: AdminUserListItem[]; meta: PaginationMeta }> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.role) q.set('role', params.role);
  if (params.status) q.set('status', params.status);
  const qs = q.toString();
  return adminFetch<{ data: AdminUserListItem[]; meta: PaginationMeta }>(
    `/api/admin/users${qs ? `?${qs}` : ''}`,
  ).then((raw: any) => {
    // BE returns data at top level since adminFetch already unwraps .data
    if (Array.isArray(raw)) {
      return { data: raw, meta: {} as PaginationMeta };
    }
    return raw;
  });
}

export async function updateUserStatus(userId: string, status: string): Promise<void> {
  await adminFetch(`/api/admin/users/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  await adminFetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}


// ── Community Admin Types & API ──────────────────────────────────────────────

export interface AdminPostListItem {
  id: string;
  board_type: string;
  title: string;
  author_name: string;
  author_email: string;
  status: string;
  is_pinned: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface AdminPostListParams {
  page?: number;
  limit?: number;
  search?: string;
  board_type?: string;
  status?: string;
}

export async function fetchAdminPosts(
  params: AdminPostListParams = {},
): Promise<{ data: AdminPostListItem[]; meta: PaginationMeta }> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.board_type) q.set('board_type', params.board_type);
  if (params.status) q.set('status', params.status);
  const qs = q.toString();
  return adminFetch<{ data: AdminPostListItem[]; meta: PaginationMeta }>(
    `/api/admin/community${qs ? `?${qs}` : ''}`,
  ).then((raw: any) => {
    if (Array.isArray(raw)) {
      return { data: raw, meta: {} as PaginationMeta };
    }
    return raw;
  });
}

export async function updatePostStatus(postId: string, status: string): Promise<void> {
  await adminFetch(`/api/admin/community/${encodeURIComponent(postId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function togglePostPin(postId: string, isPinned: boolean): Promise<void> {
  await adminFetch(`/api/admin/community/${encodeURIComponent(postId)}/pin`, {
    method: 'PATCH',
    body: JSON.stringify({ is_pinned: isPinned }),
  });
}

export async function deletePost(postId: string): Promise<void> {
  await adminFetch(`/api/admin/community/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
  });
}

/** Shared pagination meta type */
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
