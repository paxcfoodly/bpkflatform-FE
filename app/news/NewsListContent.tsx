/**
 * BPK Hub — News List Content (Client Component)
 * Type tabs (전체/뉴스/공지), search, pagination, card grid.
 */
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Eye, Pin } from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { SearchBar } from '@/components/ui/SearchBar';
import { ControlledPagination } from '@/components/ui/Pagination';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { useNewsList } from '@/hooks/use-news';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

/** 유형 탭 */
const TYPE_TABS = [
  { label: '전체', value: null },
  { label: '뉴스', value: 'NEWS' },
  { label: '공지', value: 'NOTICE' },
] as const;

/** 유형 뱃지 variant 매핑 */
function typeBadge(type: string) {
  switch (type) {
    case 'NEWS':
      return { label: '뉴스', variant: 'info' as const };
    case 'NOTICE':
      return { label: '공지', variant: 'warning' as const };
    default:
      return { label: type, variant: 'secondary' as const };
  }
}

/** 날짜 포맷 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function NewsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialType = searchParams.get('type') || null;
  const initialSearch = searchParams.get('search') || '';

  const [page, setPage] = useState(initialPage);
  const [type, setType] = useState<string | null>(initialType);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);

  // Query
  const { data: newsData, isLoading, isError, error } = useNewsList({
    page,
    limit: PAGE_SIZE,
    type: type ?? undefined,
    search: search || undefined,
  });

  const newsList = newsData?.data ?? [];
  const meta = newsData?.meta;

  // Update URL params
  const updateUrl = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams();
      const allParams: Record<string, string | null> = {
        page: String(page),
        type,
        search,
        ...params,
      };

      Object.entries(allParams).forEach(([key, value]) => {
        if (
          value &&
          value !== 'null' &&
          !(key === 'page' && value === '1')
        ) {
          newParams.set(key, value);
        }
      });

      const qs = newParams.toString();
      router.replace(`/news${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [page, type, search, router],
  );

  const handleTypeChange = (val: string | null) => {
    setType(val);
    setPage(1);
    updateUrl({ type: val, page: '1' });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    updateUrl({ search: value || null, page: '1' });
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
          { label: '뉴스·공지', href: '/news' },
        ]}
        className="mb-6"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold sm:text-3xl">뉴스·공지</h1>
        </div>
        <p className="text-muted-foreground">
          BPK Hub의 최신 뉴스와 공지사항을 확인하세요.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-xl">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="제목, 내용으로 검색..."
        />
      </div>

      {/* Type Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted-foreground">
          유형:
        </span>
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTypeChange(tab.value)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              type === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Result Count */}
      {meta && (
        <div className="mb-4 text-sm text-muted-foreground">
          총{' '}
          <span className="font-semibold text-foreground">{meta.total}</span>건
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="font-medium text-destructive">
            뉴스 목록을 불러오는 데 실패했습니다.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : '잠시 후 다시 시도해주세요.'}
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* News Grid */}
      {!isLoading && !isError && newsList.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((item) => {
            const badge = typeBadge(item.type);
            return (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="group flex flex-col rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Thumbnail */}
                {item.thumbnail_url && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  {/* Badges */}
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {item.is_pinned && (
                      <span className="flex items-center gap-0.5 text-xs text-primary font-medium">
                        <Pin className="h-3 w-3" />
                        고정
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  {item.summary && (
                    <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
                      {item.summary}
                    </p>
                  )}

                  {/* Footer: Date + Views */}
                  <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span>{formatDate(item.published_at || item.created_at)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {item.view_count}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && newsList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Newspaper className="h-16 w-16 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">뉴스가 없습니다</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? `'${search}'에 대한 검색 결과가 없습니다.`
              : '아직 등록된 뉴스·공지가 없습니다.'}
          </p>
          {(search || type) && (
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setType(null);
                setPage(1);
                updateUrl({ search: null, type: null, page: '1' });
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
