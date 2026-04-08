/**
 * BPK Hub — Admin TanStack Query Hooks
 * Cached data fetching for admin dashboard + product CRUD.
 */
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  fetchDashboard,
  fetchAdminProducts,
  fetchAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAdminAnnouncements,
  fetchAdminAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  triggerAnnouncementCollection,
  fetchAdminInquiries,
  fetchAdminInquiry,
  updateInquiryStatus,
  fetchAdminNews,
  fetchAdminNewsItem,
  createNews,
  updateNews,
  deleteNews,
  fetchAdminUsers,
  updateUserStatus,
  updateUserRole,
  fetchAdminPosts,
  updatePostStatus,
  togglePostPin,
  deletePost,
  type AdminProductListParams,
  type AdminAnnouncementListParams,
  type AdminInquiryListParams,
  type AdminNewsListParams,
  type AdminUserListParams,
  type AdminPostListParams,
} from '@/lib/api/admin';

/** 관리자 쿼리 키 팩토리 */
export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  products: () => [...adminKeys.all, 'products'] as const,
  productList: (params: AdminProductListParams) =>
    [...adminKeys.products(), 'list', params] as const,
  productDetail: (id: string) =>
    [...adminKeys.products(), 'detail', id] as const,
  announcements: () => [...adminKeys.all, 'announcements'] as const,
  announcementList: (params: AdminAnnouncementListParams) =>
    [...adminKeys.announcements(), 'list', params] as const,
  announcementDetail: (id: string) =>
    [...adminKeys.announcements(), 'detail', id] as const,
  inquiries: () => [...adminKeys.all, 'inquiries'] as const,
  inquiryList: (params: AdminInquiryListParams) =>
    [...adminKeys.inquiries(), 'list', params] as const,
  inquiryDetail: (id: string) =>
    [...adminKeys.inquiries(), 'detail', id] as const,
  news: () => [...adminKeys.all, 'news'] as const,
  newsList: (params: AdminNewsListParams) =>
    [...adminKeys.news(), 'list', params] as const,
  newsDetail: (id: string) =>
    [...adminKeys.news(), 'detail', id] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  userList: (params: AdminUserListParams) =>
    [...adminKeys.users(), 'list', params] as const,
  posts: () => [...adminKeys.all, 'posts'] as const,
  postList: (params: AdminPostListParams) =>
    [...adminKeys.posts(), 'list', params] as const,
};

/** 대시보드 통계 조회 훅 */
export function useDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: fetchDashboard,
    staleTime: 60_000, // 1 minute
  });
}

// ── Product Admin Hooks ─────────────────────────────────────────────────────

/** 관리자 제품 목록 조회 훅 */
export function useAdminProducts(params: AdminProductListParams = {}) {
  return useQuery({
    queryKey: adminKeys.productList(params),
    queryFn: () => fetchAdminProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 관리자 제품 상세 조회 훅 */
export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: adminKeys.productDetail(id),
    queryFn: () => fetchAdminProduct(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** 제품 등록 뮤테이션 */
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.products() });
    },
  });
}

/** 제품 수정 뮤테이션 */
export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateProduct>[1] }) =>
      updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.products() });
    },
  });
}

/** 제품 삭제 뮤테이션 */
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.products() });
    },
  });
}

// ── Announcement Admin Hooks ────────────────────────────────────────────────

/** 관리자 공고 목록 조회 훅 */
export function useAdminAnnouncements(params: AdminAnnouncementListParams = {}) {
  return useQuery({
    queryKey: adminKeys.announcementList(params),
    queryFn: () => fetchAdminAnnouncements(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 공고 상세 조회 훅 */
export function useAdminAnnouncement(id: string) {
  return useQuery({
    queryKey: adminKeys.announcementDetail(id),
    queryFn: () => fetchAdminAnnouncement(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** 공고 등록 뮤테이션 */
export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.announcements() });
    },
  });
}

/** 공고 수정 뮤테이션 */
export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAnnouncement>[1] }) =>
      updateAnnouncement(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.announcements() });
    },
  });
}

/** 공고 삭제 뮤테이션 */
export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.announcements() });
    },
  });
}

/** 공고 수집 트리거 뮤테이션 */
export function useTriggerCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: triggerAnnouncementCollection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.announcements() });
    },
  });
}

// ── Inquiry Admin Hooks ─────────────────────────────────────────────────────

/** 관리자 문의 목록 조회 훅 */
export function useAdminInquiries(params: AdminInquiryListParams = {}) {
  return useQuery({
    queryKey: adminKeys.inquiryList(params),
    queryFn: () => fetchAdminInquiries(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 관리자 문의 상세 조회 훅 */
export function useAdminInquiry(id: string) {
  return useQuery({
    queryKey: adminKeys.inquiryDetail(id),
    queryFn: () => fetchAdminInquiry(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** 문의 상태 변경 뮤테이션 */
export function useUpdateInquiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: string; adminNote?: string }) =>
      updateInquiryStatus(id, status, adminNote),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.inquiries() });
    },
  });
}

// ── News Admin Hooks ────────────────────────────────────────────────────────

/** 관리자 뉴스·공지 목록 조회 훅 */
export function useAdminNews(params: AdminNewsListParams = {}) {
  return useQuery({
    queryKey: adminKeys.newsList(params),
    queryFn: () => fetchAdminNews(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 관리자 뉴스·공지 상세 조회 훅 */
export function useAdminNewsItem(id: string) {
  return useQuery({
    queryKey: adminKeys.newsDetail(id),
    queryFn: () => fetchAdminNewsItem(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** 뉴스·공지 등록 뮤테이션 */
export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.news() });
    },
  });
}

/** 뉴스·공지 수정 뮤테이션 */
export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateNews>[1] }) =>
      updateNews(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.news() });
    },
  });
}

/** 뉴스·공지 삭제 뮤테이션 */
export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.news() });
    },
  });
}


// ── User Admin Hooks ─────────────────────────────────────────────────────────

/** 관리자 회원 목록 조회 훅 */
export function useAdminUsers(params: AdminUserListParams = {}) {
  return useQuery({
    queryKey: adminKeys.userList(params),
    queryFn: () => fetchAdminUsers(params),
    placeholderData: keepPreviousData,
  });
}

/** 회원 상태 변경 뮤테이션 */
export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}

/** 회원 역할 변경 뮤테이션 */
export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}


// ── Community Admin Hooks ────────────────────────────────────────────────────

/** 관리자 게시글 목록 조회 훅 */
export function useAdminPosts(params: AdminPostListParams = {}) {
  return useQuery({
    queryKey: adminKeys.postList(params),
    queryFn: () => fetchAdminPosts(params),
    placeholderData: keepPreviousData,
  });
}

/** 게시글 상태 변경 뮤테이션 */
export function useUpdatePostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: string }) =>
      updatePostStatus(postId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.posts() });
    },
  });
}

/** 게시글 공지 고정 토글 뮤테이션 */
export function useTogglePostPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, isPinned }: { postId: string; isPinned: boolean }) =>
      togglePostPin(postId, isPinned),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.posts() });
    },
  });
}

/** 게시글 삭제 뮤테이션 */
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.posts() });
    },
  });
}
