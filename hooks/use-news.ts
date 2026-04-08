/**
 * BPK Hub — News TanStack Query Hooks
 * Cached data fetching for news list and detail.
 */
'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchNewsList,
  fetchNewsDetail,
  type NewsListParams,
} from '@/lib/api/news';

/** 뉴스 쿼리 키 팩토리 */
export const newsKeys = {
  all: ['news'] as const,
  lists: () => [...newsKeys.all, 'list'] as const,
  list: (params: NewsListParams) => [...newsKeys.lists(), params] as const,
  details: () => [...newsKeys.all, 'detail'] as const,
  detail: (id: string) => [...newsKeys.details(), id] as const,
};

/** 뉴스 목록 조회 훅 */
export function useNewsList(params: NewsListParams = {}) {
  return useQuery({
    queryKey: newsKeys.list(params),
    queryFn: () => fetchNewsList(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 뉴스 상세 조회 훅 */
export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => fetchNewsDetail(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}
