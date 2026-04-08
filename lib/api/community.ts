/**
 * BPK Hub — Community API Client
 * Typed fetch wrappers for /api/community/* endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export type BoardType = 'FREE' | 'QUESTION' | 'INFO' | 'JOB';

export interface PostListItem {
  id: string;
  board_type: BoardType;
  title: string;
  status: string;
  is_pinned: boolean;
  author_nickname: string;
  author_company: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_scrapped: boolean;
  created_at: string;
}

export interface PostAuthor {
  id: string;
  name: string;
  company_name: string | null;
}

export interface FileItem {
  id: string;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export interface PostDetail {
  id: string;
  board_type: BoardType;
  title: string;
  content: string;
  status: string;
  is_pinned: boolean;
  author: PostAuthor;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_scrapped: boolean;
  files: FileItem[];
  created_at: string;
  updated_at: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  author_nickname: string;
  author_company: string | null;
  is_deleted: boolean;
  parent_id: string | null;
  replies: CommentResponse[];
  created_at: string;
  updated_at: string;
}

export interface PostCreateRequest {
  board_type: BoardType;
  title: string;
  content: string;
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
}

export interface CommentCreateRequest {
  content: string;
  parent_id?: string | null;
}

export interface CommentUpdateRequest {
  content: string;
}

export interface LikeResponse {
  is_liked: boolean;
  like_count: number;
}

export interface ScrapResponse {
  is_scrapped: boolean;
  message: string;
}

export interface PostListParams {
  board_type?: BoardType;
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
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

export class CommunityApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'CommunityApiError';
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

async function communityFetch<T>(
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
    throw new CommunityApiError(res.status, code, detail);
  }

  return res.json();
}

// ── Post API Functions ───────────────────────────────────────────────────────

/** 게시글 목록 조회 (페이지네이션, 필터, 검색, 정렬) */
export async function fetchPosts(
  params: PostListParams = {},
): Promise<PaginatedResponse<PostListItem>> {
  const searchParams = new URLSearchParams();

  if (params.board_type) searchParams.set('board_type', params.board_type);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.sort_order) searchParams.set('sort_order', params.sort_order);

  const qs = searchParams.toString();
  return communityFetch<PaginatedResponse<PostListItem>>(
    `/api/community/posts${qs ? `?${qs}` : ''}`,
  );
}

/** 게시글 상세 조회 */
export async function fetchPost(id: string): Promise<PostDetail> {
  const res = await communityFetch<SuccessResponse<PostDetail>>(
    `/api/community/posts/${encodeURIComponent(id)}`,
  );
  return res.data;
}

/** 게시글 작성 (JWT 필수) */
export async function createPost(
  data: PostCreateRequest,
): Promise<PostDetail> {
  const res = await communityFetch<SuccessResponse<PostDetail>>(
    '/api/community/posts',
    { method: 'POST', body: JSON.stringify(data) },
  );
  return res.data;
}

/** 게시글 수정 (JWT 필수) */
export async function updatePost(
  id: string,
  data: PostUpdateRequest,
): Promise<PostDetail> {
  const res = await communityFetch<SuccessResponse<PostDetail>>(
    `/api/community/posts/${encodeURIComponent(id)}`,
    { method: 'PUT', body: JSON.stringify(data) },
  );
  return res.data;
}

/** 게시글 삭제 (JWT 필수) */
export async function deletePost(id: string): Promise<void> {
  await communityFetch(
    `/api/community/posts/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
}

/** 좋아요 토글 (JWT 필수) */
export async function togglePostLike(postId: string): Promise<LikeResponse> {
  const res = await communityFetch<SuccessResponse<LikeResponse>>(
    `/api/community/posts/${encodeURIComponent(postId)}/like`,
    { method: 'POST' },
  );
  return res.data;
}

/** 스크랩 토글 (JWT 필수) */
export async function togglePostScrap(postId: string): Promise<ScrapResponse> {
  const res = await communityFetch<SuccessResponse<ScrapResponse>>(
    `/api/community/posts/${encodeURIComponent(postId)}/scrap`,
    { method: 'POST' },
  );
  return res.data;
}

// ── Comment API Functions ────────────────────────────────────────────────────

/** 댓글 목록 조회 */
export async function fetchComments(
  postId: string,
): Promise<CommentResponse[]> {
  const res = await communityFetch<SuccessResponse<CommentResponse[]>>(
    `/api/community/posts/${encodeURIComponent(postId)}/comments`,
  );
  return res.data;
}

/** 댓글 작성 (JWT 필수) */
export async function createComment(
  postId: string,
  data: CommentCreateRequest,
): Promise<CommentResponse> {
  const res = await communityFetch<SuccessResponse<CommentResponse>>(
    `/api/community/posts/${encodeURIComponent(postId)}/comments`,
    { method: 'POST', body: JSON.stringify(data) },
  );
  return res.data;
}

/** 댓글 수정 (JWT 필수) */
export async function updateComment(
  commentId: string,
  data: CommentUpdateRequest,
): Promise<CommentResponse> {
  const res = await communityFetch<SuccessResponse<CommentResponse>>(
    `/api/community/comments/${encodeURIComponent(commentId)}`,
    { method: 'PUT', body: JSON.stringify(data) },
  );
  return res.data;
}

/** 댓글 삭제 (JWT 필수) */
export async function deleteComment(commentId: string): Promise<void> {
  await communityFetch(
    `/api/community/comments/${encodeURIComponent(commentId)}`,
    { method: 'DELETE' },
  );
}
