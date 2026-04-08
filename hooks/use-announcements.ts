/**
 * BPK Hub — Announcement TanStack Query Hooks
 * Cached data fetching for announcement list, detail, and scrap toggle.
 */
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  fetchAnnouncements,
  fetchAnnouncement,
  toggleAnnouncementScrap,
  type AnnouncementListParams,
  type AnnouncementListItem,
  type PaginatedResponse,
} from '@/lib/api/announcements';

/** 공고 쿼리 키 팩토리 */
export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (params: AnnouncementListParams) =>
    [...announcementKeys.lists(), params] as const,
  details: () => [...announcementKeys.all, 'detail'] as const,
  detail: (id: string) => [...announcementKeys.details(), id] as const,
};

/** 공고 목록 조회 훅 */
export function useAnnouncements(params: AnnouncementListParams = {}) {
  return useQuery({
    queryKey: announcementKeys.list(params),
    queryFn: () => fetchAnnouncements(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 공고 상세 조회 훅 */
export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: () => fetchAnnouncement(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** 스크랩 토글 mutation */
export function useToggleScrap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) =>
      toggleAnnouncementScrap(announcementId),
    onMutate: async (announcementId: string) => {
      // Cancel outgoing queries for list data
      await queryClient.cancelQueries({
        queryKey: announcementKeys.lists(),
      });

      // Optimistic update: toggle is_scrapped in all cached lists
      const previousQueries = queryClient.getQueriesData<
        PaginatedResponse<AnnouncementListItem>
      >({
        queryKey: announcementKeys.lists(),
      });

      queryClient.setQueriesData<PaginatedResponse<AnnouncementListItem>>(
        { queryKey: announcementKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === announcementId
                ? { ...item, is_scrapped: !item.is_scrapped }
                : item,
            ),
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({
        queryKey: announcementKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: announcementKeys.details(),
      });
    },
  });
}
