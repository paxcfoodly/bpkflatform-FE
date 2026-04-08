/**
 * BPK Hub — PostDetailContent (Client)
 * 게시글 상세 페이지 클라이언트 컴포넌트.
 */
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Eye,
  Calendar,
  Building2,
  Pencil,
  Trash2,
  FileDown,
  Pin,
} from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/Modal';
import { usePost, useDeletePost } from '@/hooks/use-community';
import { useAuthStore } from '@/stores/authStore';
import { PostActions } from '@/components/community/PostActions';
import { CommentSection } from '@/components/community/CommentSection';
import { cn } from '@/lib/utils';
import type { BoardType, FileItem } from '@/lib/api/community';
import { useState } from 'react';

// ── Constants ────────────────────────────────────────────────────────────────

const BOARD_LABELS: Record<BoardType, string> = {
  FREE: '자유',
  QUESTION: '질문',
  INFO: '정보',
  JOB: '구인',
};

const BOARD_COLORS: Record<BoardType, string> = {
  FREE: 'bg-blue-100 text-blue-700',
  QUESTION: 'bg-amber-100 text-amber-700',
  INFO: 'bg-green-100 text-green-700',
  JOB: 'bg-purple-100 text-purple-700',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ── FileList ─────────────────────────────────────────────────────────────────

function FileList({ files }: { files: FileItem[] }) {
  if (files.length === 0) return null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="mt-6 rounded-lg border bg-muted/30 p-4">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
        첨부파일 ({files.length})
      </h3>
      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <a
            key={file.id}
            href={`${apiBase}${file.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <FileDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{file.original_name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface PostDetailContentProps {
  boardType: string;
  postId: string;
}

export default function PostDetailContent({
  boardType,
  postId,
}: PostDetailContentProps) {
  const router = useRouter();
  const { data: post, isLoading, isError, error } = usePost(postId);
  const deleteMutation = useDeletePost();
  const user = useAuthStore((s) => s.user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const apiBoardType = (post?.board_type ?? boardType.toUpperCase()) as BoardType;
  const isOwner = user && post && post.author.id === user.id;

  const handleDelete = () => {
    deleteMutation.mutate(postId, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        router.push(`/community/${boardType}`);
      },
    });
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-5 w-48" />
        <Skeleton className="mb-4 h-8 w-3/4" />
        <Skeleton className="mb-2 h-5 w-1/3" />
        <div className="mt-6 rounded-lg border p-6">
          <SkeletonText lines={8} />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError || !post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-lg font-semibold text-destructive">
            게시글을 불러올 수 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : '잠시 후 다시 시도해주세요.'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/community/${boardType}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: '홈', href: '/' },
          { label: '커뮤니티', href: '/community' },
          {
            label: BOARD_LABELS[apiBoardType] ?? boardType,
            href: `/community/${boardType}`,
          },
          { label: post.title, href: `/community/${boardType}/${postId}` },
        ]}
        className="mb-6"
      />

      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </button>

      {/* Header */}
      <div className="mb-6">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium',
              BOARD_COLORS[apiBoardType],
            )}
          >
            {BOARD_LABELS[apiBoardType]}
          </span>
          {post.is_pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Pin className="h-3 w-3" />
              고정
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold sm:text-3xl">{post.title}</h1>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            {post.author.name}
            {post.author.company_name && (
              <span className="text-xs">({post.author.company_name})</span>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDateTime(post.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            조회 {post.view_count.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Owner actions: edit / delete */}
      {isOwner && (
        <div className="mb-4 flex items-center gap-2">
          <Link href={`/community/${boardType}/${postId}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" />
              수정
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="rounded-lg border p-6">
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </div>

      {/* Attached Files */}
      <FileList files={post.files} />

      {/* Action bar: like, scrap, share */}
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <PostActions
          postId={postId}
          isLiked={post.is_liked}
          likeCount={post.like_count}
          isScrapped={post.is_scrapped}
        />
      </div>

      {/* Comments */}
      <CommentSection postId={postId} />

      {/* Bottom navigation */}
      <div className="mt-8 border-t pt-6">
        <Link
          href={`/community/${boardType}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 삭제</DialogTitle>
            <DialogDescription>
              정말 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
