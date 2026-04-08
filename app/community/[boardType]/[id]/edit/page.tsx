/**
 * BPK Hub — Post Edit Page (/community/[boardType]/[id]/edit)
 * 기존 게시글 수정. Tiptap 에디터에 initialContent 전달, 본인 글만 수정 가능.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/form/FormInput';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/authStore';
import { usePost, useUpdatePost } from '@/hooks/use-community';

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

// ── Zod Schema ───────────────────────────────────────────────────────────────

const editSchema = z.object({
  title: z
    .string()
    .min(1, { message: '제목을 입력해주세요' })
    .max(200, { message: '제목은 200자 이내로 입력해주세요' }),
  content: z
    .string()
    .min(1, { message: '내용을 입력해주세요' }),
});

type EditFormData = z.infer<typeof editSchema>;

// ── Component ────────────────────────────────────────────────────────────────

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ boardType: string; id: string }>();
  const boardType = params.boardType;
  const postId = params.id;

  const { user, hydrated } = useAuthStore();
  const { data: post, isLoading, isError } = usePost(postId);
  const updatePost = useUpdatePost();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hydrated && !user) {
      router.replace(
        `/auth/login?redirect=/community/${boardType}/${postId}/edit`,
      );
    }
  }, [hydrated, user, router, boardType, postId]);

  // Populate form when post data loads
  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        content: post.content,
      });
      setEditorReady(true);
    }
  }, [post, reset]);

  // Redirect if not the author (once both user and post are loaded)
  useEffect(() => {
    if (hydrated && user && post && post.author.id !== user.id) {
      router.replace(`/community/${boardType}`);
    }
  }, [hydrated, user, post, router, boardType]);

  const onSubmit = async (data: EditFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updatePost.mutateAsync({
        id: postId,
        data: {
          title: data.title,
          content: data.content,
        },
      });
      router.push(`/community/${boardType}/${postId}`);
    } catch (err) {
      console.error('[EditPost] Update failed:', err);
      alert(
        err instanceof Error
          ? err.message
          : '게시글 수정에 실패했습니다. 다시 시도해주세요.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading states
  if (!hydrated || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-5 w-64" />
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[280px] w-full" />
        </div>
      </main>
    );
  }

  if (isError || !post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">
            게시글을 불러올 수 없습니다.
          </p>
          <Link href={`/community/${boardType}`}>
            <Button variant="outline">목록으로 돌아가기</Button>
          </Link>
        </div>
      </main>
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
          {
            label: post.title.length > 20
              ? post.title.slice(0, 20) + '…'
              : post.title,
            href: `/community/${boardType}/${postId}`,
          },
          { label: '수정', href: '#' },
        ]}
        className="mb-6"
      />

      {/* Back button */}
      <Link
        href={`/community/${boardType}/${postId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        돌아가기
      </Link>

      <h1 className="mb-6 text-2xl font-bold">글 수정</h1>

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
          {editorReady && (
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  initialContent={post.content}
                  onChange={field.onChange}
                  placeholder="내용을 입력해주세요..."
                />
              )}
            />
          )}
          {errors.content?.message && (
            <p className="text-sm text-destructive" role="alert">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/community/${boardType}/${postId}`}>
            <Button type="button" variant="outline">
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                수정 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                수정하기
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
