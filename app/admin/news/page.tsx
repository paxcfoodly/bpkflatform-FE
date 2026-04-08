/**
 * BPK Hub — 관리자 뉴스·공지 목록 CMS 페이지
 * /admin/news
 */
'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Pin } from 'lucide-react';

import { Button, Badge, SearchBar, ControlledPagination, Skeleton } from '@/components/ui';
import { useAdminNews, useDeleteNews } from '@/hooks/use-admin';
import { useToast } from '@/components/ui/Toast';
import { FormSelect, type SelectOption } from '@/components/form';
import type { AdminNewsListParams } from '@/lib/api/admin';

// ── Type / Status helpers ───────────────────────────────────────────────────

const TYPE_OPTIONS: SelectOption[] = [
  { label: '전체', value: '' },
  { label: '뉴스', value: 'NEWS' },
  { label: '공지', value: 'NOTICE' },
];

function typeBadgeVariant(type: string) {
  switch (type) {
    case 'NEWS':
      return 'default' as const;
    case 'NOTICE':
      return 'warning' as const;
    default:
      return 'outline' as const;
  }
}

function typeLabel(type: string) {
  switch (type) {
    case 'NEWS':
      return '뉴스';
    case 'NOTICE':
      return '공지';
    default:
      return type;
  }
}

// ── Inner content (uses useSearchParams) ─────────────────────────────────────

function NewsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Parse URL search params
  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const typeFilter = searchParams.get('type') || '';

  const [searchValue, setSearchValue] = useState(search);

  const params: AdminNewsListParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(typeFilter && { type: typeFilter }),
  };

  const { data, isLoading, isError, error: fetchError } = useAdminNews(params);
  const deleteMutation = useDeleteNews();

  // ── Navigation helpers ──
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!('page' in updates)) params.set('page', '1');
      router.push(`/admin/news?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = (value: string) => {
    updateParams({ search: value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ type: e.target.value });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" 뉴스/공지를 삭제하시겠습니까?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast('뉴스/공지가 삭제되었습니다.', 'success');
    } catch {
      toast('삭제에 실패했습니다.', 'error');
    }
  };

  const newsList = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">뉴스·공지 관리</h1>
        <Link href="/admin/news/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            등록
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="제목으로 검색"
          />
        </div>
        <div className="w-36">
          <FormSelect
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={handleTypeChange}
            placeholder="유형"
          />
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <div className="py-12 text-center text-destructive">
          목록을 불러올 수 없습니다.{' '}
          {fetchError instanceof Error ? fetchError.message : ''}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : newsList.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          등록된 뉴스·공지가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">유형</th>
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">게시</th>
                <th className="px-4 py-3 font-medium text-center">고정</th>
                <th className="px-4 py-3 font-medium text-right">조회수</th>
                <th className="px-4 py-3 font-medium">등록일</th>
                <th className="px-4 py-3 font-medium text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Badge variant={typeBadgeVariant(item.type)}>
                      {typeLabel(item.type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.is_published ? 'success' : 'secondary'}>
                      {item.is_published ? '발행' : '미발행'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.is_pinned && (
                      <Pin className="mx-auto h-4 w-4 text-primary" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{item.view_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/news/${item.id}/edit`}>
                        <Button variant="ghost" size="icon" aria-label="수정">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="삭제"
                        onClick={() => handleDelete(item.id, item.title)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <ControlledPagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

// ── Page (Suspense boundary for useSearchParams) ─────────────────────────────

export default function AdminNewsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <NewsListContent />
    </Suspense>
  );
}
