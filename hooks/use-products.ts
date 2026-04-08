/**
 * BPK Hub — Product TanStack Query Hooks
 * Cached data fetching for product list, detail, and categories.
 */
'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchProduct,
  fetchCategories,
  type ProductListParams,
} from '@/lib/api/products';

/** 제품 목록 쿼리 키 팩토리 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
};

/** 제품 목록 조회 훅 */
export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** 제품 상세 조회 훅 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** 카테고리 목록 조회 훅 */
export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 5 * 60_000, // 5 minutes
  });
}
