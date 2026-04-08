/**
 * BPK Hub — Announcement List Content (Client Component)
 * Category tabs, D-Day badges, scrap, search, pagination.
 */
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Megaphone,
  Bookmark,
  BookmarkCheck,
  Eye,
  ExternalLink,
  Building2,
} from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { SearchBar } from '@/components/ui/SearchBar';
import { ControlledPagination } from '@/components/ui/Pagination';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { DDayBadge, Badge, CategoryTag } from '@/components/ui/Badge';
import { useAnnouncements, useToggleScrap } from '@/hooks/use-announcements';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { AnnouncementListItem } from '@/lib/api/announcements';

const PAGE_SIZE = 12;

/** 카테고리/상태 필터 탭 */
const STATUS_TABS = [
  { label: '전체', value: null },
  { label: '진행중', value: 'OPEN' },
  { label: '예정', value: 'UPCOMING' },
  { label: '마감', value: 'CLOSED' },
] as const;

const CATEGORY_TABS = [
  { label: '전체', value: null },
  { label: '금융', value: '금융' },
  { label: '기술', value: '기술' },
  { label: '인력', value: '인력' },
  { label: '수출', value: '수출' },
  { label: '내수', value: '내수' },
  { label: '창업', value: '창업' },
  { label: '경영', value: '경영' },
] as const;

/** 날짜 포맷 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** Scrap Button — 비로그인 시 로그인 페이지로 이동 */
function ScrapButton({
  item,
  onToggle,
  isLoading,
}: {
  item: AnnouncementListItem;
  onToggle: (id: string) => void;
  isLoading: boolean;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/auth/login?redirect=/info/announcements');
      return;
    }

    onToggle(item.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'shrink-0 rounded-md p-1.5 transition-colors',
        item.is_scrapped
          ? 'text-primary hover:text-primary/80'
          : 'text-muted-foreground hover:text-foreground',
        isLoading && 'opacity-50',
      )}
      aria-label={item.is_scrapped ? '스크랩 해제' : '스크랩'}
      title={user ? (item.is_scrapped ? '스크랩 해제' : '스크랩') : '로그인이 필요합니다'}
    >
      {item.is_scrapped ? (
        <BookmarkCheck className="h-5 w-5" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </button>
  );
}

export function AnnouncementListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialCategory = searchParams.get('category') || null;
  const initialStatus = searchParams.get('status') || null;
  const initialSearch = searchParams.get('search') || '';

  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);

  // Queries
  const { data: announcementsData, isLoading, isError, error } = useAnnouncements({
    page,
    limit: PAGE_SIZE,
    category: category ?? undefined,
    status: status ?? undefined,
    search: search || undefined,
    sort_by: 'end_date',
    sort_order: 'asc',
  });

  const scrapMutation = useToggleScrap();

  const announcements = announcementsData?.data ?? [];
  const meta = announcementsData?.meta;

  // Update URL params
  const updateUrl = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams();
      const allParams: Record<string, string | null> = {
        page: String(page),
        category,
        status,
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
      router.replace(`/info/announcements${qs ? `?${qs}` : ''}`, {
        scroll: false,
      });
    },
    [page, category, status, search, router],
  );

  const handleStatusChange = (val: string | null) => {
    setStatus(val);
    setPage(1);
    updateUrl({ status: val, page: '1' });
  };

  const handleCategoryChange = (val: string | null) => {
    setCategory(val);
    setPage(1);
    updateUrl({ category: val, page: '1' });
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

  const handleScrapToggle = (id: string) => {
    scrapMutation.mutate(id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: '홈', href: '/' },
          { label: '공고/지원사업', href: '/info/announcements' },
        ]}
        className="mb-6"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold sm:text-3xl">
            정부 공고 · 지원사업
          </h1>
        </div>
        <p className="text-muted-foreground">
          기업마당에서 수집한 최신 정부 공고와 지원사업을 확인하세요. 마감 임박
          순으로 정렬됩니다.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-xl">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="공고명, 기관명, 키워드로 검색..."
        />
      </div>

      {/* Status Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted-foreground">
          상태:
        </span>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              status === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted-foreground">
          분야:
        </span>
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleCategoryChange(tab.value)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              category === tab.value
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
          총 <span className="font-semibold text-foreground">{meta.total}</span>
          건
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="font-medium text-destructive">
            공고 목록을 불러오는 데 실패했습니다.
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

      {/* Announcement Grid */}
      {!isLoading && !isError && announcements.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item) => (
            <Link
              key={item.id}
              href={`/info/announcements/${item.id}`}
              className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Top: D-Day + Category + Scrap */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.d_day !== null && item.d_day !== undefined ? (
                    <DDayBadge daysLeft={item.d_day} />
                  ) : item.status === 'CLOSED' ? (
                    <Badge variant="secondary">마감</Badge>
                  ) : null}
                  {item.category && (
                    <CategoryTag label={item.category} />
                  )}
                </div>
                <ScrapButton
                  item={item}
                  onToggle={handleScrapToggle}
                  isLoading={scrapMutation.isPending}
                />
              </div>

              {/* Title */}
              <h3 className="mb-2 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              {/* Organization */}
              <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{item.organization}</span>
              </div>

              {/* Footer: Dates + Views */}
              <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span>
                  {formatDate(item.start_date)} ~ {formatDate(item.end_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {item.view_count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && announcements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Megaphone className="h-16 w-16 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">공고가 없습니다</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? `'${search}'에 대한 검색 결과가 없습니다.`
              : '선택한 필터에 해당하는 공고가 없습니다.'}
          </p>
          {(search || category || status) && (
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setCategory(null);
                setStatus(null);
                setPage(1);
                updateUrl({
                  search: null,
                  category: null,
                  status: null,
                  page: '1',
                });
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
