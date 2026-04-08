/**
 * BPK Hub — 관리자 공고 수정 CMS 페이지
 * /admin/announcements/[id]/edit
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button, Skeleton } from '@/components/ui';
import { FormInput, FormSelect, FormTextarea } from '@/components/form';
import { useToast } from '@/components/ui/Toast';
import { useAdminAnnouncement, useUpdateAnnouncement } from '@/hooks/use-admin';
import type { SelectOption } from '@/components/form';

// ── Zod Schema ──────────────────────────────────────────────────────────────

const announcementEditSchema = z.object({
  title: z.string().min(1, { message: '공고 제목을 입력해주세요' }).max(500),
  organization: z.string().min(1, { message: '기관명을 입력해주세요' }).max(200),
  category: z.string().max(100).optional(),
  content: z.string().optional(),
  status: z.string().min(1, { message: '상태를 선택해주세요' }),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type AnnouncementEditFormData = z.infer<typeof announcementEditSchema>;

const STATUS_OPTIONS: SelectOption[] = [
  { label: '진행중', value: 'OPEN' },
  { label: '예정', value: 'UPCOMING' },
  { label: '마감', value: 'CLOSED' },
];

/** Convert ISO date string to datetime-local format */
function toDatetimeLocal(isoStr: string | null): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    // Format: YYYY-MM-DDThh:mm
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function AdminAnnouncementEditPage() {
  const router = useRouter();
  const params = useParams();
  const announcementId = params.id as string;
  const { toast } = useToast();

  const { data: announcement, isLoading, isError } = useAdminAnnouncement(announcementId);
  const updateMutation = useUpdateAnnouncement();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementEditFormData>({
    resolver: zodResolver(announcementEditSchema),
    defaultValues: {
      title: '',
      organization: '',
      category: '',
      content: '',
      status: 'OPEN',
      start_date: '',
      end_date: '',
    },
  });

  // Prefill form when announcement data loads
  useEffect(() => {
    if (announcement) {
      reset({
        title: announcement.title,
        organization: announcement.organization,
        category: announcement.category ?? '',
        content: announcement.content ?? '',
        status: announcement.status,
        start_date: toDatetimeLocal(announcement.start_date),
        end_date: toDatetimeLocal(announcement.end_date),
      });
    }
  }, [announcement, reset]);

  const onSubmit = async (formData: AnnouncementEditFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: announcementId,
        data: {
          title: formData.title,
          organization: formData.organization,
          category: formData.category || undefined,
          content: formData.content || undefined,
          status: formData.status,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        },
      });
      toast('공고가 수정되었습니다.', 'success');
      router.push('/admin/announcements');
    } catch {
      toast('공고 수정에 실패했습니다.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError || (!isLoading && !announcement)) {
    return (
      <div className="py-12 text-center text-destructive">
        공고 정보를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/announcements">
          <Button variant="ghost" size="icon" aria-label="뒤로가기">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">공고 수정</h1>
      </div>

      {/* Source URL (read-only) */}
      {announcement?.source_url && (
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">원문 URL</span>
          <a
            href={announcement.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate text-sm text-primary underline"
          >
            {announcement.source_url}
          </a>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label="공고 제목 *"
          placeholder="공고 제목을 입력해주세요"
          error={errors.title?.message}
          {...register('title')}
        />

        <FormInput
          label="기관명 *"
          placeholder="기관명을 입력해주세요"
          error={errors.organization?.message}
          {...register('organization')}
        />

        <FormInput
          label="분야"
          placeholder="예: 금융, 기술, 인력"
          error={errors.category?.message}
          {...register('category')}
        />

        <FormSelect
          label="상태 *"
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="접수 시작일"
            type="datetime-local"
            error={errors.start_date?.message}
            {...register('start_date')}
          />
          <FormInput
            label="접수 마감일"
            type="datetime-local"
            error={errors.end_date?.message}
            {...register('end_date')}
          />
        </div>

        <FormTextarea
          label="공고 내용"
          placeholder="공고 상세 내용을 입력해주세요"
          rows={8}
          error={errors.content?.message}
          {...register('content')}
        />

        {/* Actions */}
        <div className="flex items-center gap-4 border-t pt-6">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            저장
          </Button>
          <Link href="/admin/announcements">
            <Button variant="outline" type="button">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
