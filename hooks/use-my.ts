/**
 * BPK Hub — MyPage & Notification TanStack Query Hooks
 * Cached data fetching + mutations for /api/my/* and /api/notifications/*.
 */
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  fetchMyPageSummary,
  fetchMyProfile,
  fetchMyScraps,
  deleteScrap,
  fetchMyInquiries,
  fetchMyInquiry,
  fetchMyPosts,
  updateProfile,
  changePassword,
  deleteAccount,
  fetchNotificationSettings,
  updateNotificationSettings,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  fetchUnreadCount,
  type ScrapListParams,
  type InquiryListParams,
  type PostListParams,
  type NotificationListParams,
  type ProfileUpdateData,
  type PasswordChangeData,
  type AccountDeleteData,
  type NotificationSettingsUpdate,
} from '@/lib/api/my';

// ── Query Key Factory ───────────────────────────────────────────────────────

export const myKeys = {
  all: ['my'] as const,
  summary: () => [...myKeys.all, 'summary'] as const,
  profile: () => [...myKeys.all, 'profile'] as const,
  scraps: () => [...myKeys.all, 'scraps'] as const,
  scrapList: (params: ScrapListParams) =>
    [...myKeys.scraps(), 'list', params] as const,
  inquiries: () => [...myKeys.all, 'inquiries'] as const,
  inquiryList: (params: InquiryListParams) =>
    [...myKeys.inquiries(), 'list', params] as const,
  inquiryDetail: (id: string) =>
    [...myKeys.inquiries(), 'detail', id] as const,
  posts: () => [...myKeys.all, 'posts'] as const,
  postList: (params: PostListParams) =>
    [...myKeys.posts(), 'list', params] as const,
  notificationSettings: () =>
    [...myKeys.all, 'notification-settings'] as const,
  notifications: () => ['notifications'] as const,
  notificationList: (params: NotificationListParams) =>
    [...myKeys.notifications(), 'list', params] as const,
  unreadCount: () => [...myKeys.notifications(), 'unread-count'] as const,
};

// ── Query Hooks ─────────────────────────────────────────────────────────────

/** 마이페이지 요약 */
export function useMyPageSummary() {
  return useQuery({
    queryKey: myKeys.summary(),
    queryFn: fetchMyPageSummary,
    staleTime: 60_000,
  });
}

/** 내 프로필 조회 */
export function useMyProfile() {
  return useQuery({
    queryKey: myKeys.profile(),
    queryFn: fetchMyProfile,
    staleTime: 60_000,
  });
}

/** 스크랩 목록 */
export function useMyScraps(params: ScrapListParams = {}) {
  return useQuery({
    queryKey: myKeys.scrapList(params),
    queryFn: () => fetchMyScraps(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 내 문의 목록 */
export function useMyInquiries(params: InquiryListParams = {}) {
  return useQuery({
    queryKey: myKeys.inquiryList(params),
    queryFn: () => fetchMyInquiries(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 내 문의 상세 */
export function useMyInquiry(id: string) {
  return useQuery({
    queryKey: myKeys.inquiryDetail(id),
    queryFn: () => fetchMyInquiry(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** 내 게시글 목록 */
export function useMyPosts(params: PostListParams = {}) {
  return useQuery({
    queryKey: myKeys.postList(params),
    queryFn: () => fetchMyPosts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 알림 설정 조회 */
export function useNotificationSettings() {
  return useQuery({
    queryKey: myKeys.notificationSettings(),
    queryFn: fetchNotificationSettings,
    staleTime: 60_000,
  });
}

/** 알림 목록 */
export function useNotifications(params: NotificationListParams = {}) {
  return useQuery({
    queryKey: myKeys.notificationList(params),
    queryFn: () => fetchNotifications(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 안 읽은 알림 수 */
export function useUnreadCount() {
  return useQuery({
    queryKey: myKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    staleTime: 30_000,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

/** 스크랩 삭제 */
export function useDeleteScrap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteScrap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myKeys.scraps() });
      qc.invalidateQueries({ queryKey: myKeys.summary() });
    },
  });
}

/** 프로필 수정 */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdateData) => updateProfile(data),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: myKeys.profile() });
      // GNB 헤더 이름 즉시 반영: authStore의 user.name 동기화
      if (variables.name) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({ ...currentUser, name: variables.name });
        }
      }
    },
  });
}

/** 비밀번호 변경 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: PasswordChangeData) => changePassword(data),
  });
}

/** 회원 탈퇴 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: (data: AccountDeleteData) => deleteAccount(data),
  });
}

/** 알림 설정 변경 */
export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationSettingsUpdate) =>
      updateNotificationSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myKeys.notificationSettings() });
    },
  });
}

/** 알림 읽음 처리 */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myKeys.notifications() });
      qc.invalidateQueries({ queryKey: myKeys.unreadCount() });
    },
  });
}

/** 전체 알림 읽음 처리 */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myKeys.notifications() });
      qc.invalidateQueries({ queryKey: myKeys.unreadCount() });
    },
  });
}
