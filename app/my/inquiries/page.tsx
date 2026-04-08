'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  ControlledPagination,
  LoadingSpinner,
} from '@/components/ui';
import { FormSelect } from '@/components/form/FormSelect';
import { useMyInquiries } from '@/hooks/use-my';
import type { MyInquiryListItem } from '@/lib/api/my';

// ── Constants ───────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: '전체 유형', value: '' },
  { label: '견적 문의', value: 'QUOTE' },
  { label: '일반 문의', value: 'GENERAL' },
  { label: 'A/S 문의', value: 'AS' },
];

const STATUS_OPTIONS = [
  { label: '전체 상태', value: '' },
  { label: '접수', value: 'RECEIVED' },
  { label: '처리중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'COMPLETED' },
];

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'warning' | 'success' | 'info'> = {
  RECEIVED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
};

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: '접수',
  IN_PROGRESS: '처리중',
  COMPLETED: '완료',
};

const TYPE_LABEL: Record<string, string> = {
  QUOTE: '견적',
  GENERAL: '일반',
  AS: 'A/S',
};

// ── Inquiry Card ────────────────────────────────────────────────────────────

function InquiryCard({ inquiry }: { inquiry: MyInquiryListItem }) {
  const statusVariant = STATUS_BADGE_VARIANT[inquiry.status] ?? 'default';
  const statusLabel = STATUS_LABEL[inquiry.status] ?? inquiry.status;
  const typeLabel = TYPE_LABEL[inquiry.type] ?? inquiry.type;

  return (
    <Link href={`/my/inquiries/${inquiry.id}`}>
      <Card className="transition-all hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{typeLabel}</Badge>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>
            <p className="mt-1 truncate text-sm font-medium">
              {inquiry.title}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
              {inquiry.processed_at && (
                <> · 처리: {new Date(inquiry.processed_at).toLocaleDateString('ko-KR')}</>
              )}
            </p>
          </div>

          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Inner (needs searchParams) ──────────────────────────────────────────────

function InquiriesInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get('type') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const { data, isLoading, error } = useMyInquiries({
    type: type || undefined,
    status: status || undefined,
    page,
    limit: 10,
  });

  const setParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/my/inquiries?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="py-20 text-center text-destructive">
        문의 내역을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">문의내역</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-40">
          <FormSelect
            options={TYPE_OPTIONS}
            value={type}
            onChange={(e) =>
              setParams({ type: e.target.value, page: '1' })
            }
          />
        </div>
        <div className="w-40">
          <FormSelect
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) =>
              setParams({ status: e.target.value, page: '1' })
            }
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <MessageSquare className="mb-4 h-12 w-12 opacity-30" />
          <p>문의 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((inquiry) => (
              <InquiryCard key={inquiry.id} inquiry={inquiry} />
            ))}
          </div>

          <ControlledPagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(p) => setParams({ page: String(p) })}
          />
        </>
      )}
    </div>
  );
}

/**
 * 문의 내역 목록 페이지 (P29).
 * useSearchParams → Suspense 래핑 필수 (Next.js 14 SSG).
 */
export default function InquiriesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InquiriesInner />
    </Suspense>
  );
}
