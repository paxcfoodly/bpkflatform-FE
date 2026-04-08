/**
 * BPK Hub — Post Write Page (/community/[boardType]/write)
 * Tiptap 리치 텍스트 에디터 + React Hook Form + Zod v4 검증.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/form/FormInput';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { useAuthStore } from '@/stores/authStore';
import { useCreatePost } from '@/hooks/use-community';
import type { BoardType } from '@/lib/api/community';

// ── Dynamic import: Tiptap cannot SSR ────────────────────────────────────────

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

// ── Board labels ─────────────────────────────────────────────────────────────

const BOARD_LABELS: Record<string, string> = {
  free: '자유게시판',
  question: '질문게시판',
  info: '정보공유',
  job: '구인구직',
};

const VALID_BOARDS = ['free', 'question', 'info', 'job'] as const;

// ── Zod Schema ───────────────────────────────────────────────────────────────

const postSchema = z.object({
  title: z
    .string()
    .min(1, { message: '제목을 입력해주세요' })
    .max(200, { message: '제목은 200자 이내로 입력해주세요' }),
  content: z
    .string()
    .min(1, { message: '내용을 입력해주세요' }),
});

type PostFormData = z.infer<typeof postSchema>;

// ── Component ────────────────────────────────────────────────────────────────

export default function WritePostPage() {
  const router = useRouter();
  const params = useParams<{ boardType: string }>();
  const boardType = params.boardType;

  const { user, hydrated } = useAuthStore();
  const createPost = useCreatePost();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidBoard = VALID_BOARDS.includes(
    boardType as (typeof VALID_BOARDS)[number],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/auth/login?redirect=/community/${boardType}/write`);
    }
  }, [hydrated, user, router, boardType]);

  // Redirect if invalid board type
  useEffect(() => {
    if (!isValidBoard) {
      router.replace('/community');
    }
  }, [isValidBoard, router]);

  const onSubmit = async (data: PostFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await createPost.mutateAsync({
        board_type: boardType.toUpperCase() as BoardType,
        title: data.title,
        content: data.content,
      });
      router.push(`/community/${boardType}`);
    } catch (err) {
      console.error('[WritePost] Create failed:', err);
      alert(
        err instanceof Error
          ? err.message
          : '게시글 작성에 실패했습니다. 다시 시도해주세요.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show nothing until auth is hydrated or invalid board
  if (!hydrated || !user || !isValidBoard) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: '커뮤니티', href: '/community' },
          {
            label: BOARD_LABELS[boardType] ?? boardType,
            href: `/community/${boardType}`,
          },
          { label: '글쓰기', href: '#' },
        ]}
        className="mb-6"
      />

      {/* Back button */}
      <Link
        href={`/community/${boardType}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로 돌아가기
      </Link>

      <h1 className="mb-6 text-2xl font-bold">글쓰기</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Board type (read-only) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            게시판
          </label>
          <input
            type="text"
            value={BOARD_LABELS[boardType] ?? boardType}
            disabled
            className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
          />
        </div>

        {/* Title */}
        <FormInput
          label="제목"
          placeholder="제목을 입력해주세요"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Content (Tiptap Editor) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            내용
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

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/community/${boardType}`}>
            <Button type="button" variant="outline">
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                등록 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                등록하기
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
