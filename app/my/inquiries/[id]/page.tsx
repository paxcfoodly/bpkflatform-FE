'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  LoadingSpinner,
} from '@/components/ui';
import { useMyInquiry } from '@/hooks/use-my';

// ── Constants ───────────────────────────────────────────────────────────────

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
  QUOTE: '견적 문의',
  GENERAL: '일반 문의',
  AS: 'A/S 문의',
};

/**
 * 문의 상세 페이지.
 * useParams로 id 추출 → useMyInquiry(id)로 데이터 조회.
 * BE에서 user_id 기반 권한 필터 → 본인 문의만 조회 가능.
 */
export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: inquiry, isLoading, error } = useMyInquiry(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive">
          문의 내역을 불러올 수 없습니다.
        </p>
        <button
          onClick={() => router.push('/my/inquiries')}
          className="mt-4 text-sm text-primary underline"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!inquiry) return null;

  const statusVariant = STATUS_BADGE_VARIANT[inquiry.status] ?? 'default';
  const statusLabel = STATUS_LABEL[inquiry.status] ?? inquiry.status;
  const typeLabel = TYPE_LABEL[inquiry.type] ?? inquiry.type;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/my/inquiries')}
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </button>

      {/* Inquiry detail */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{typeLabel}</Badge>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <CardTitle className="mt-2">{inquiry.title}</CardTitle>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              작성일: {new Date(inquiry.created_at).toLocaleDateString('ko-KR')}
            </span>
            {inquiry.processed_at && (
              <span>
                처리일: {new Date(inquiry.processed_at).toLocaleDateString('ko-KR')}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Meta info */}
          {(inquiry.company_name || inquiry.equipment_model) && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              {inquiry.company_name && (
                <p>
                  <span className="font-medium">회사명:</span>{' '}
                  {inquiry.company_name}
                </p>
              )}
              {inquiry.equipment_model && (
                <p className="mt-1">
                  <span className="font-medium">장비 모델:</span>{' '}
                  {inquiry.equipment_model}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              문의 내용
            </h3>
            <div className="whitespace-pre-wrap rounded-lg border p-4 text-sm leading-relaxed">
              {inquiry.content}
            </div>
          </div>

          {/* Admin reply */}
          {inquiry.admin_note && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" />
                관리자 답변
              </h3>
              <div className="whitespace-pre-wrap rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">
                {inquiry.admin_note}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
