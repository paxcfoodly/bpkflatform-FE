/**
 * BPK Hub — 관리자 뉴스·공지 등록 CMS 페이지
 * /admin/news/new
 */
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { Button, ImageUpload } from '@/components/ui';
import { FormInput, FormSelect, FormCheckbox } from '@/components/form';

const RichTextEditor = dynamic(
  () =>
    import('@/components/community/RichTextEditor').then(
      (mod) => mod.RichTextEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] animate-pulse rounded-md border bg-muted/50" />
    ),
  },
);
import { useToast } from '@/components/ui/Toast';
import { useCreateNews } from '@/hooks/use-admin';
import type { SelectOption } from '@/components/form';

// ── Zod Schema ──────────────────────────────────────────────────────────────

const newsSchema = z.object({
  type: z.string().min(1, { message: '유형을 선택해주세요' }),
  title: z.string().min(1, { message: '제목을 입력해주세요' }).max(500),
  content: z.string().min(1, { message: '내용을 입력해주세요' }),
  summary: z.string().max(500).optional(),
  thumbnail_url: z.string().max(500).optional(),
  is_published: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;

const TYPE_OPTIONS: SelectOption[] = [
  { label: '뉴스', value: 'NEWS' },
  { label: '공지', value: 'NOTICE' },
];

// ── Page Component ──────────────────────────────────────────────────────────

export default function AdminNewsNewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateNews();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      type: 'NEWS',
      title: '',
      content: '',
      summary: '',
      thumbnail_url: '',
      is_published: false,
      is_pinned: false,
    },
  });

  const onSubmit = async (formData: NewsFormData) => {
    try {
      await createMutation.mutateAsync({
        type: formData.type,
        title: formData.title,
        content: formData.content,
        summary: formData.summary || undefined,
        thumbnail_url: formData.thumbnail_url || undefined,
        is_published: formData.is_published ?? false,
        is_pinned: formData.is_pinned ?? false,
      });
      toast('뉴스/공지가 등록되었습니다.', 'success');
      router.push('/admin/news');
    } catch {
      toast('등록에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/news">
          <Button variant="ghost" size="icon" aria-label="뒤로가기">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">뉴스·공지 등록</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSelect
          label="유형 *"
          options={TYPE_OPTIONS}
          error={errors.type?.message}
          {...register('type')}
        />

        <FormInput
          label="제목 *"
          placeholder="제목을 입력해주세요"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* 내용 — Tiptap Rich Text Editor */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            내용 *
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                onChange={field.onChange}
                placeholder="내용을 입력해주세요..."
              />
            )}
          />
          {errors.content?.message && (
            <p className="text-sm text-destructive" role="alert">
              {errors.content.message}
            </p>
          )}
        </div>

        <FormInput
          label="요약"
          placeholder="뉴스 요약 (목록에 표시)"
          error={errors.summary?.message}
          {...register('summary')}
        />

        <Controller
          name="thumbnail_url"
          control={control}
          render={({ field }) => (
            <ImageUpload
              label="썸네일 이미지"
              value={field.value || undefined}
              onChange={(url) => field.onChange(url ?? '')}
            />
          )}
        />

        <div className="flex gap-6">
          <FormCheckbox
            label="발행"
            {...register('is_published')}
          />
          <FormCheckbox
            label="상단 고정"
            {...register('is_pinned')}
          />
        </div>

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
          <Link href="/admin/news">
            <Button variant="outline" type="button">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
