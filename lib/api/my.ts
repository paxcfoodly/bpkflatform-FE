/**
 * BPK Hub — MyPage & Notification API Client
 * Typed fetch wrappers for /api/my/* and /api/notifications/* endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Envelope / Pagination Types ─────────────────────────────────────────────

interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta: { timestamp: string };
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

// ── Error ───────────────────────────────────────────────────────────────────

export class MyApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'MyApiError';
    this.status = status;
    this.code = code;
  }
}

// ── Helper (mirrors adminFetch) ─────────────────────────────────────────────

async function myFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

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
    throw new MyApiError(res.status, code, detail);
  }

  const json: SuccessEnvelope<T> = await res.json();
  return json.data;
}

/**
 * myFetch variant that returns the full paginated response
 * (doesn't unwrap data from SuccessEnvelope, because paginated endpoints
 * return {success, data[], meta} at the top level).
 */
async function myFetchPaginated<T>(
  path: string,
  init: RequestInit = {},
): Promise<PaginatedResponse<T>> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

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
    throw new MyApiError(res.status, code, detail);
  }

  return res.json();
}

// ── Query-string builder ────────────────────────────────────────────────────

function buildQs(params: object): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      sp.set(k, String(v));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

// ── MyPage Types (mirrors BE schemas/my.py) ─────────────────────────────────

export interface MyPageSummary {
  scrap_count: number;
  inquiry_count: number;
  post_count: number;
  unread_notification_count: number;
}

export interface ScrapTargetInfo {
  id: string;
  title: string;
  type: string | null;
}

export interface ScrapListItem {
  id: string;
  target_type: string; // ANNOUNCEMENT | PRODUCT | POST
  target: ScrapTargetInfo | null;
  created_at: string;
}

export interface MyInquiryListItem {
  id: string;
  type: string;
  status: string;
  title: string;
  created_at: string;
  processed_at: string | null;
}

export interface MyInquiryDetail {
  id: string;
  type: string;
  status: string;
  title: string;
  content: string;
  product_id: string | null;
  company_name: string | null;
  equipment_model: string | null;
  admin_note: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface MyPostListItem {
  id: string;
  board_type: string;
  title: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company_name: string | null;
  business_number: string | null;
  profile_image_url: string | null;
  created_at: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  company_name?: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

export interface AccountDeleteData {
  password: string;
  reason?: string;
}

export interface NotificationSettings {
  email_notification: boolean;
  announcement_alert: boolean;
  price_alert: boolean;
  comment_reply_alert: boolean;
  inquiry_status_alert: boolean;
}

export interface NotificationSettingsUpdate {
  email_notification?: boolean;
  announcement_alert?: boolean;
  price_alert?: boolean;
  comment_reply_alert?: boolean;
  inquiry_status_alert?: boolean;
}

// ── Notification Types (mirrors BE schemas/notification.py) ─────────────────

export interface NotificationListItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationReadResponse {
  id: string;
  is_read: boolean;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// ── Params ──────────────────────────────────────────────────────────────────

export interface ScrapListParams {
  target_type?: string;
  page?: number;
  limit?: number;
}

export interface InquiryListParams {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PostListParams {
  board_type?: string;
  page?: number;
  limit?: number;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
}

// ── API Functions: MyPage (/api/my/*) ───────────────────────────────────────

/** 마이페이지 요약 */
export async function fetchMyPageSummary(): Promise<MyPageSummary> {
  return myFetch<MyPageSummary>('/api/my/summary');
}

/** 내 프로필 조회 */
export async function fetchMyProfile(): Promise<ProfileResponse> {
  return myFetch<ProfileResponse>('/api/my/profile');
}

/** 스크랩 목록 */
export async function fetchMyScraps(
  params: ScrapListParams = {},
): Promise<PaginatedResponse<ScrapListItem>> {
  return myFetchPaginated<ScrapListItem>(`/api/my/scraps${buildQs(params)}`);
}

/** 스크랩 삭제 */
export async function deleteScrap(scrapId: string): Promise<void> {
  await myFetch<{ deleted: boolean }>(
    `/api/my/scraps/${encodeURIComponent(scrapId)}`,
    { method: 'DELETE' },
  );
}

/** 내 문의 목록 */
export async function fetchMyInquiries(
  params: InquiryListParams = {},
): Promise<PaginatedResponse<MyInquiryListItem>> {
  return myFetchPaginated<MyInquiryListItem>(`/api/my/inquiries${buildQs(params)}`);
}

/** 내 문의 상세 */
export async function fetchMyInquiry(inquiryId: string): Promise<MyInquiryDetail> {
  return myFetch<MyInquiryDetail>(
    `/api/my/inquiries/${encodeURIComponent(inquiryId)}`,
  );
}

/** 내 게시글 목록 */
export async function fetchMyPosts(
  params: PostListParams = {},
): Promise<PaginatedResponse<MyPostListItem>> {
  return myFetchPaginated<MyPostListItem>(`/api/my/posts${buildQs(params)}`);
}

/** 프로필 수정 */
export async function updateProfile(
  data: ProfileUpdateData,
): Promise<ProfileResponse> {
  return myFetch<ProfileResponse>('/api/my/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** 비밀번호 변경 */
export async function changePassword(
  data: PasswordChangeData,
): Promise<void> {
  await myFetch<{ changed: boolean }>('/api/my/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** 회원 탈퇴 */
export async function deleteAccount(
  data: AccountDeleteData,
): Promise<void> {
  await myFetch<{ deleted: boolean }>('/api/my/account', {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
}

/** 알림 설정 조회 */
export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  return myFetch<NotificationSettings>('/api/my/notification-settings');
}

/** 알림 설정 변경 */
export async function updateNotificationSettings(
  data: NotificationSettingsUpdate,
): Promise<NotificationSettings> {
  return myFetch<NotificationSettings>('/api/my/notification-settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── API Functions: Notifications (/api/notifications/*) ─────────────────────

/** 알림 목록 */
export async function fetchNotifications(
  params: NotificationListParams = {},
): Promise<PaginatedResponse<NotificationListItem>> {
  return myFetchPaginated<NotificationListItem>(
    `/api/notifications${buildQs(params)}`,
  );
}

/** 알림 읽음 처리 */
export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationReadResponse> {
  return myFetch<NotificationReadResponse>(
    `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: 'PUT' },
  );
}

/** 전체 알림 읽음 처리 */
export async function markAllNotificationsRead(): Promise<void> {
  await myFetch<{ marked_count: number }>('/api/notifications/read-all', {
    method: 'PUT',
  });
}

/** 안 읽은 알림 수 */
export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  return myFetch<UnreadCountResponse>('/api/notifications/unread-count');
}
