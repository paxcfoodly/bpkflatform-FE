/**
 * BPK Hub — 관리자 문의 목록 CMS 페이지
 * /admin/inquiries
 */
'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye } from 'lucide-react';

import { Button, Badge, SearchBar, ControlledPagination, Skeleton } from '@/components/ui';
import { useAdminInquiries } from '@/hooks/use-admin';
import { FormSelect, type SelectOption } from '@/components/form';
import type { AdminInquiryListParams } from '@/lib/api/admin';

// ── Filter options ──────────────────────────────────────────────────────────

const TYPE_OPTIONS: SelectOption[] = [
  { label: '전체 유형', value: '' },
  { label: '견적 요청', value: 'QUOTE' },
  { label: '1:1 문의', value: 'CONTACT' },
  { label: 'A/S 신청', value: 'AS' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: '전체 상태', value: '' },
  { label: '접수', value: 'RECEIVED' },
  { label: '처리중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'COMPLETED' },
  { label: '취소', value: 'CANCELLED' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function typeBadgeVariant(type: string) {
  switch (type) {
    case 'QUOTE':
      return 'info' as const;
    case 'CONTACT':
      return 'default' as const;
    case 'AS':
      return 'warning' as const;
    default:
      return 'outline' as const;
  }
}

function typeLabel(type: string) {
  switch (type) {
    case 'QUOTE':
      return '견적';
    case 'CONTACT':
      return '문의';
    case 'AS':
      return 'A/S';
    default:
      return type;
  }
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'RECEIVED':
      return 'warning' as const;
    case 'IN_PROGRESS':
      return 'info' as const;
    case 'COMPLETED':
      return 'success' as const;
    case 'CANCELLED':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'RECEIVED':
      return '접수';
    case 'IN_PROGRESS':
      return '처리중';
    case 'COMPLETED':
      return '완료';
    case 'CANCELLED':
      return '취소';
    default:
      return status;
  }
}

// ── Inner content ────────────────────────────────────────────────────────────

function InquiryListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const typeFilter = searchParams.get('type') || '';
  const statusFilter = searchParams.get('status') || '';

  const [searchValue, setSearchValue] = useState(search);

  const params: AdminInquiryListParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(typeFilter && { type: typeFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, isError, error: fetchError } = useAdminInquiries(params);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) p.set(key, value);
        else p.delete(key);
      });
      if (!('page' in updates)) p.set('page', '1');
      router.push(`/admin/inquiries?${p.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = (value: string) => updateParams({ search: value });
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParams({ type: e.target.value });
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParams({ status: e.target.value });
  const handlePageChange = (newPage: number) => updateParams({ page: String(newPage) });

  const inquiries = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">문의 관리</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="이름·회사명·이메일·제목으로 검색"
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
          문의 목록을 불러올 수 없습니다.{' '}
          {fetchError instanceof Error ? fetchError.message : ''}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          접수된 문의가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">회사명</th>
                <th className="px-4 py-3 font-medium">담당자명</th>
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">유형</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">접수일</th>
                <th className="px-4 py-3 font-medium text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">
                    {inq.company_name ?? '-'}
                  </td>
                  <td className="px-4 py-3 font-medium">{inq.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {inq.title}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={typeBadgeVariant(inq.type)}>
                      {typeLabel(inq.type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(inq.status)}>
                      {statusLabel(inq.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inq.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <Link href={`/admin/inquiries/${inq.id}`}>
                        <Button variant="ghost" size="icon" aria-label="상세보기">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminInquiriesPage() {
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
      <InquiryListContent />
    </Suspense>
  );
}
