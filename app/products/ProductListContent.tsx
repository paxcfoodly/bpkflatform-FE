/**
 * BPK Hub — Product List Content (Client Component)
 * Uses useSearchParams → must be wrapped in Suspense.
 */
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package } from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { SearchBar } from '@/components/ui/SearchBar';
import { ControlledPagination } from '@/components/ui/Pagination';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ProductCardItem } from '@/components/products/ProductCardItem';
import { ProductFilter } from '@/components/products/ProductFilter';
import { useProducts, useCategories } from '@/hooks/use-products';

const PAGE_SIZE = 12;

export function ProductListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialCategory = searchParams.get('category') || null;
  const initialSearch = searchParams.get('search') || '';
  const initialSortBy = searchParams.get('sort_by') || 'created_at';
  const initialSortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';

  const [page, setPage] = useState(initialPage);
  const [categoryId, setCategoryId] = useState<string | null>(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Queries
  const { data: categoriesData } = useCategories();
  const { data: productsData, isLoading, isError, error } = useProducts({
    page,
    limit: PAGE_SIZE,
    category_id: categoryId ?? undefined,
    search: search || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const categories = categoriesData ?? [];
  const products = productsData?.data ?? [];
  const meta = productsData?.meta;

  // Update URL params
  const updateUrl = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams();
      const allParams: Record<string, string | null> = {
        page: String(page),
        category: categoryId,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...params,
      };

      Object.entries(allParams).forEach(([key, value]) => {
        if (
          value &&
          value !== 'null' &&
          !(key === 'page' && value === '1') &&
          !(key === 'sort_by' && value === 'created_at') &&
          !(key === 'sort_order' && value === 'desc')
        ) {
          newParams.set(key, value);
        }
      });

      const qs = newParams.toString();
      router.replace(`/products${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [page, categoryId, search, sortBy, sortOrder, router],
  );

  const handleCategoryChange = (id: string | null) => {
    setCategoryId(id);
    setPage(1);
    updateUrl({ category: id, page: '1' });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    updateUrl({ search: value || null, page: '1' });
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
    updateUrl({ sort_by: newSortBy, sort_order: newSortOrder, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: '홈', href: '/' },
          { label: '장비 마켓', href: '/products' },
        ]}
        className="mb-6"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold sm:text-3xl">포장장비 마켓</h1>
        </div>
        <p className="text-muted-foreground">
          BPK의 다양한 포장장비를 둘러보세요. 카테고리별 필터와 검색으로 원하는 장비를
          찾을 수 있습니다.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-xl">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="장비명, 키워드로 검색..."
        />
      </div>

      {/* Filter: Category Tabs + Sort */}
      <div className="mb-6">
        <ProductFilter
          categories={categories}
          selectedCategory={categoryId}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          totalCount={meta?.total}
        />
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="font-medium text-destructive">
            제품 목록을 불러오는 데 실패했습니다.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.'}
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && !isError && products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCardItem key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">제품이 없습니다</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? `'${search}'에 대한 검색 결과가 없습니다.`
              : '선택한 카테고리에 등록된 제품이 없습니다.'}
          </p>
          {(search || categoryId) && (
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setCategoryId(null);
                setPage(1);
                updateUrl({ search: null, category: null, page: '1' });
              }}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              필터 초기화
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-8">
          <ControlledPagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
