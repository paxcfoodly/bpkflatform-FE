/**
 * BPK Hub — 관리자 공고 수동 등록 CMS 페이지
 * /admin/announcements/new
 */
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui';
import { FormInput, FormSelect, FormTextarea } from '@/components/form';
import { useToast } from '@/components/ui/Toast';
import { useCreateAnnouncement } from '@/hooks/use-admin';
import type { SelectOption } from '@/components/form';

// ── Zod Schema ──────────────────────────────────────────────────────────────

const announcementSchema = z.object({
  title: z.string().min(1, { message: '공고 제목을 입력해주세요' }).max(500),
  source_url: z
    .string()
    .min(1, { message: '원문 URL을 입력해주세요' })
    .url({ message: '올바른 URL 형식이 아닙니다' }),
  organization: z.string().min(1, { message: '기관명을 입력해주세요' }).max(200),
  category: z.string().max(100).optional(),
  content: z.string().optional(),
  status: z.string().min(1, { message: '상태를 선택해주세요' }),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

const STATUS_OPTIONS: SelectOption[] = [
  { label: '진행중', value: 'OPEN' },
  { label: '예정', value: 'UPCOMING' },
  { label: '마감', value: 'CLOSED' },
];

// ── Page Component ──────────────────────────────────────────────────────────

export default function AdminAnnouncementNewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateAnnouncement();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      source_url: '',
      organization: '',
      category: '',
      content: '',
      status: 'OPEN',
      start_date: '',
      end_date: '',
    },
  });

  const onSubmit = async (formData: AnnouncementFormData) => {
    try {
      await createMutation.mutateAsync({
        title: formData.title,
        source_url: formData.source_url,
        organization: formData.organization,
        category: formData.category || undefined,
        content: formData.content || undefined,
        status: formData.status,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
      });
      toast('공고가 등록되었습니다.', 'success');
      router.push('/admin/announcements');
    } catch {
      toast('공고 등록에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/announcements">
          <Button variant="ghost" size="icon" aria-label="뒤로가기">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">공고 수동 등록</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label="공고 제목 *"
          placeholder="공고 제목을 입력해주세요"
          error={errors.title?.message}
          {...register('title')}
        />

        <FormInput
          label="원문 URL *"
          placeholder="https://..."
          helperText="원문 공고 페이지 URL (고유값)"
          error={errors.source_url?.message}
          {...register('source_url')}
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
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            등록
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
