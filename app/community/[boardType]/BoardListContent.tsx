/**
 * BPK Hub — Board List Content (Client Component)
 * 게시판별 목록: Tabs(게시판 전환), SearchBar, PostListItem, Pagination.
 */
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { SearchBar } from '@/components/ui/SearchBar';
import { ControlledPagination } from '@/components/ui/Pagination';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { PostListItem } from '@/components/community/PostListItem';
import { usePosts, useToggleScrap } from '@/hooks/use-community';
import { useAuthStore } from '@/stores/authStore';
import type { BoardType } from '@/lib/api/community';

const PAGE_SIZE = 20;

const BOARD_TABS = [
  { label: '자유', value: 'free' },
  { label: '질문', value: 'question' },
  { label: '정보', value: 'info' },
  { label: '구인', value: 'job' },
];

const BOARD_LABELS: Record<string, string> = {
  free: '자유게시판',
  question: '질문게시판',
  info: '정보공유',
  job: '구인구직',
};

const SORT_OPTIONS = [
  { label: '최신순', value: 'latest' },
  { label: '인기순', value: 'popular' },
  { label: '조회순', value: 'views' },
];

function sortToApi(sort: string): { sort_by: string; sort_order: 'asc' | 'desc' } {
  switch (sort) {
    case 'popular':
      return { sort_by: 'like_count', sort_order: 'desc' };
    case 'views':
      return { sort_by: 'view_count', sort_order: 'desc' };
    default:
      return { sort_by: 'created_at', sort_order: 'desc' };
  }
}

interface BoardListContentProps {
  boardType: string;
}

export function BoardListContent({ boardType }: BoardListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  // Read initial state from URL
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'latest';

  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);

  const apiSort = sortToApi(sort);

  const { data, isLoading, isError, error } = usePosts({
    board_type: boardType.toUpperCase() as BoardType,
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sort_by: apiSort.sort_by,
    sort_order: apiSort.sort_order,
  });

  const scrapMutation = useToggleScrap();

  const posts = data?.data ?? [];
  const meta = data?.meta;

  // Update URL params
  const updateUrl = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams();
      const allParams: Record<string, string | null> = {
        page: String(page),
        search,
        sort,
        ...params,
      };

      Object.entries(allParams).forEach(([key, value]) => {
        if (
          value &&
          value !== 'null' &&
          !(key === 'page' && value === '1') &&
          !(key === 'sort' && value === 'latest')
        ) {
          newParams.set(key, value);
        }
      });

      const qs = newParams.toString();
      router.replace(`/community/${boardType}${qs ? `?${qs}` : ''}`, {
        scroll: false,
      });
    },
    [page, search, sort, boardType, router],
  );

  const handleBoardChange = (value: string) => {
    router.push(`/community/${value}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    updateUrl({ search: value || null, page: '1' });
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
    updateUrl({ sort: value === 'latest' ? null : value, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrapToggle = (id: string) => {
    if (!user) {
      router.push(`/auth/login?redirect=/community/${boardType}`);
      return;
    }
    scrapMutation.mutate(id);
  };

  return (
    <>
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: '홈', href: '/' },
          { label: '커뮤니티', href: '/community' },
          { label: BOARD_LABELS[boardType] ?? boardType, href: `/community/${boardType}` },
        ]}
        className="mb-6"
      />

      {/* Header + Write Button */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {BOARD_LABELS[boardType] ?? '커뮤니티'}
        </h1>
        {user && (
          <Link
            href={`/community/${boardType}/write`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <PenSquare className="h-4 w-4" />
            글쓰기
          </Link>
        )}
      </div>

      {/* Board Tabs */}
      <Tabs
        items={BOARD_TABS}
        activeValue={boardType}
        onChange={handleBoardChange}
        className="mb-6"
      />

      {/* Search + Sort Row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm flex-1">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            placeholder="제목, 내용으로 검색..."
          />
        </div>
        <div className="flex items-center gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                sort === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
            게시글 목록을 불러오는 데 실패했습니다.
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
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Post List */}
      {!isLoading && !isError && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostListItem
              key={post.id}
              post={post}
              onScrapToggle={handleScrapToggle}
              isScrapLoading={scrapMutation.isPending}
              isLoggedIn={!!user}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageEmptyIcon />
          <h3 className="mt-4 text-lg font-semibold">게시글이 없습니다</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? `'${search}'에 대한 검색 결과가 없습니다.`
              : '아직 작성된 게시글이 없습니다. 첫 번째 글을 작성해보세요!'}
          </p>
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setPage(1);
                updateUrl({ search: null, page: '1' });
              }}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              검색 초기화
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
    </>
  );
}

/** Simple empty state icon */
function MessageEmptyIcon() {
  return (
    <svg
      className="h-16 w-16 text-muted-foreground/30"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
      />
    </svg>
  );
}
