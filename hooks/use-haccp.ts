/**
 * BPK Hub — HACCP TanStack Query Hooks
 * Cached data fetching for institution list, detail, and region filter.
 */
'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchInstitutions,
  fetchInstitution,
  fetchRegions,
  searchHaccpCompanies,
  type InstitutionListParams,
  type CompanySearchParams,
} from '@/lib/api/haccp';

/** HACCP 쿼리 키 팩토리 */
export const haccpKeys = {
  all: ['haccp'] as const,
  lists: () => [...haccpKeys.all, 'list'] as const,
  list: (params: InstitutionListParams) =>
    [...haccpKeys.lists(), params] as const,
  details: () => [...haccpKeys.all, 'detail'] as const,
  detail: (id: string) => [...haccpKeys.details(), id] as const,
  regions: () => [...haccpKeys.all, 'regions'] as const,
};

/** HACCP 인증기관 목록 조회 훅 */
export function useInstitutions(params: InstitutionListParams = {}) {
  return useQuery({
    queryKey: haccpKeys.list(params),
    queryFn: () => fetchInstitutions(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** HACCP 인증기관 상세 조회 훅 */
export function useInstitution(id: string) {
  return useQuery({
    queryKey: haccpKeys.detail(id),
    queryFn: () => fetchInstitution(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** HACCP 지역 필터 옵션 훅 (드롭다운용, staleTime 길게) */
export function useRegions() {
  return useQuery({
    queryKey: haccpKeys.regions(),
    queryFn: fetchRegions,
    staleTime: 5 * 60 * 1000,
  });
}

/** HACCP 인증업체 검색 훅 (공공 API) */
export function useHaccpCompanies(params: CompanySearchParams = {}) {
  return useQuery({
    queryKey: [...haccpKeys.all, 'companies', params] as const,
    queryFn: () => searchHaccpCompanies(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    // 검색어가 없으면 호출하지 않음
    enabled: !!(params.company || params.sido),
  });
}
