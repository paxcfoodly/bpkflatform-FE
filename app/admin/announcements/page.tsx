/**
 * BPK Hub — 관리자 공고 목록 CMS 페이지
 * /admin/announcements
 */
'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, RefreshCw, Loader2 } from 'lucide-react';

import { Button, Badge, SearchBar, ControlledPagination, Skeleton } from '@/components/ui';
import { DDayBadge } from '@/components/ui/Badge';
import {
  useAdminAnnouncements,
  useDeleteAnnouncement,
  useTriggerCollection,
} from '@/hooks/use-admin';
import { useToast } from '@/components/ui/Toast';
import { FormSelect, type SelectOption } from '@/components/form';
import type { AdminAnnouncementListParams } from '@/lib/api/admin';

// ── Status helpers ──────────────────────────────────────────────────────────

const STATUS_OPTIONS: SelectOption[] = [
  { label: '전체', value: '' },
  { label: '진행중', value: 'OPEN' },
  { label: '마감', value: 'CLOSED' },
  { label: '예정', value: 'UPCOMING' },
];

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'OPEN':
      return 'success' as const;
    case 'CLOSED':
      return 'secondary' as const;
    case 'UPCOMING':
      return 'info' as const;
    default:
      return 'outline' as const;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'OPEN':
      return '진행중';
    case 'CLOSED':
      return '마감';
    case 'UPCOMING':
      return '예정';
    default:
      return status;
  }
}

// ── Inner content (uses useSearchParams) ─────────────────────────────────────

function AnnouncementListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';

  const [searchValue, setSearchValue] = useState(search);

  const params: AdminAnnouncementListParams = {
    page,
    limit: 20,
    sort_by: 'end_date',
    sort_order: 'asc',
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, isError, error: fetchError } = useAdminAnnouncements(params);
  const deleteMutation = useDeleteAnnouncement();
  const collectMutation = useTriggerCollection();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) p.set(key, value);
        else p.delete(key);
      });
      if (!('page' in updates)) p.set('page', '1');
      router.push(`/admin/announcements?${p.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = (value: string) => updateParams({ search: value });
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParams({ status: e.target.value });
  const handlePageChange = (newPage: number) => updateParams({ page: String(newPage) });

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" 공고를 삭제하시겠습니까?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast('공고가 삭제되었습니다.', 'success');
    } catch {
      toast('공고 삭제에 실패했습니다.', 'error');
    }
  };

  const handleCollect = async () => {
    try {
      const stats = await collectMutation.mutateAsync();
      toast(
        `수집 완료: 신규 ${stats.inserted}건, 업데이트 ${stats.updated}건, 중복 ${stats.skipped}건`,
        'success',
      );
    } catch {
      toast('공고 수집에 실패했습니다.', 'error');
    }
  };

  const announcements = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">공고 관리</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCollect} disabled={collectMutation.isPending}>
            {collectMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            수집
          </Button>
          <Link href="/admin/announcements/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              수동등록
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="제목·기관명으로 검색"
          />
        </div>
        <div className="w-36">
          <FormSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatusChange}
            placeholder="상태"
          />
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <div className="py-12 text-center text-destructive">
          공고 목록을 불러올 수 없습니다.{' '}
          {fetchError instanceof Error ? fetchError.message : ''}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          등록된 공고가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">기관명</th>
                <th className="px-4 py-3 font-medium">분야</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">마감일</th>
                <th className="px-4 py-3 font-medium">D-Day</th>
                <th className="px-4 py-3 font-medium text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((ann) => (
                <tr key={ann.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="max-w-xs truncate px-4 py-3 font-medium">{ann.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ann.organization}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ann.category ?? '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(ann.status)}>
                      {statusLabel(ann.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ann.end_date
                      ? new Date(ann.end_date).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {ann.d_day != null ? <DDayBadge daysLeft={ann.d_day} /> : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/announcements/${ann.id}/edit`}>
                        <Button variant="ghost" size="icon" aria-label="수정">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="삭제"
                        onClick={() => handleDelete(ann.id, ann.title)}
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

export default function AdminAnnouncementsPage() {
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
      <AnnouncementListContent />
    </Suspense>
  );
}
