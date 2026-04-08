/**
 * BPK Hub — 관리자 문의 상세 + 상태 변경 CMS 페이지
 * /admin/inquiries/[id]
 */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button, Badge, Skeleton } from '@/components/ui';
import { FormSelect, FormTextarea } from '@/components/form';
import { useToast } from '@/components/ui/Toast';
import { useAdminInquiry, useUpdateInquiryStatus } from '@/hooks/use-admin';
import type { SelectOption } from '@/components/form';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: SelectOption[] = [
  { label: '접수', value: 'RECEIVED' },
  { label: '처리중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'COMPLETED' },
  { label: '취소', value: 'CANCELLED' },
];

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
      return '견적 요청';
    case 'CONTACT':
      return '1:1 문의';
    case 'AS':
      return 'A/S 신청';
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

// ── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex border-b py-3 last:border-0">
      <dt className="w-32 shrink-0 text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value ?? '-'}</dd>
    </div>
  );
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function AdminInquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;
  const { toast } = useToast();

  const { data: inquiry, isLoading, isError } = useAdminInquiry(inquiryId);
  const updateStatusMutation = useUpdateInquiryStatus();

  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Sync status / note when data loads
  useEffect(() => {
    if (inquiry) {
      setSelectedStatus(inquiry.status);
      setAdminNote(inquiry.admin_note ?? '');
    }
  }, [inquiry]);

  const handleSave = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: inquiryId,
        status: selectedStatus,
        adminNote: adminNote || undefined,
      });
      toast('문의 상태가 변경되었습니다.', 'success');
      router.push('/admin/inquiries');
    } catch {
      toast('상태 변경에 실패했습니다.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || (!isLoading && !inquiry)) {
    return (
      <div className="py-12 text-center text-destructive">
        문의 정보를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/inquiries">
          <Button variant="ghost" size="icon" aria-label="뒤로가기">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">문의 상세</h1>
        <Badge variant={typeBadgeVariant(inquiry!.type)}>
          {typeLabel(inquiry!.type)}
        </Badge>
        <Badge variant={statusBadgeVariant(inquiry!.status)}>
          {statusLabel(inquiry!.status)}
        </Badge>
      </div>

      {/* Read-only Info */}
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">문의 정보</h2>
        <dl>
          <InfoRow label="제목" value={inquiry!.title} />
          <InfoRow label="회사명" value={inquiry!.company_name} />
          <InfoRow label="이름" value={inquiry!.name} />
          <InfoRow label="이메일" value={inquiry!.email} />
          <InfoRow label="전화번호" value={inquiry!.phone} />
          {inquiry!.equipment_model && (
            <InfoRow label="장비 모델" value={inquiry!.equipment_model} />
          )}
          {inquiry!.purchase_date && (
            <InfoRow
              label="구매일"
              value={new Date(inquiry!.purchase_date).toLocaleDateString('ko-KR')}
            />
          )}
          <InfoRow
            label="접수일"
            value={new Date(inquiry!.created_at).toLocaleString('ko-KR')}
          />
          {inquiry!.processed_at && (
            <InfoRow
              label="처리일"
              value={new Date(inquiry!.processed_at).toLocaleString('ko-KR')}
            />
          )}
        </dl>
      </div>

      {/* Content */}
      <div className="rounded-lg border p-4">
        <h2 className="mb-3 text-lg font-semibold">문의 내용</h2>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {inquiry!.content}
        </div>
      </div>

      {/* Status Change */}
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">상태 변경</h2>

        <FormSelect
          label="상태"
          options={STATUS_OPTIONS}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        />

        <FormTextarea
          label="관리자 메모"
          placeholder="처리 내용이나 메모를 입력해주세요"
          rows={4}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />

        <div className="flex items-center gap-4 border-t pt-4">
          <Button onClick={handleSave} disabled={updateStatusMutation.isPending}>
            {updateStatusMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            저장
          </Button>
          <Link href="/admin/inquiries">
            <Button variant="outline" type="button">
              취소
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
