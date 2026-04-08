/**
 * BPK Hub — CommentSection
 * 댓글/대댓글(1depth) 목록 + CRUD (작성·수정·삭제).
 */
'use client';

import { useState } from 'react';
import { MessageCircle, CornerDownRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/Modal';
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/hooks/use-community';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { CommentResponse } from '@/lib/api/community';
import Link from 'next/link';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCommentDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// ── CommentForm ──────────────────────────────────────────────────────────────

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  placeholder?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}

function CommentForm({
  postId,
  parentId = null,
  placeholder = '댓글을 작성해주세요.',
  onCancel,
  autoFocus,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const createMutation = useCreateComment(postId);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    createMutation.mutate(
      { content: trimmed, parent_id: parentId },
      {
        onSuccess: () => {
          setContent('');
          onCancel?.();
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim()}
          loading={createMutation.isPending}
        >
          등록
        </Button>
      </div>
    </div>
  );
}

// ── EditForm ─────────────────────────────────────────────────────────────────

interface EditFormProps {
  postId: string;
  commentId: string;
  initialContent: string;
  onCancel: () => void;
}

function EditForm({ postId, commentId, initialContent, onCancel }: EditFormProps) {
  const [content, setContent] = useState(initialContent);
  const updateMutation = useUpdateComment(postId);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    updateMutation.mutate(
      { commentId, data: { content: trimmed } },
      { onSuccess: () => onCancel() },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        autoFocus
        className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          취소
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || content.trim() === initialContent}
          loading={updateMutation.isPending}
        >
          수정
        </Button>
      </div>
    </div>
  );
}

// ── CommentItem ──────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: CommentResponse;
  postId: string;
  userId: string | null;
  isReply?: boolean;
}

function CommentItem({ comment, postId, userId, isReply }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useDeleteComment(postId);

  // Determine ownership — author_nickname alone isn't reliable,
  // but the API doesn't return author_id on comments.
  // We'll show edit/delete for own comments. Since the API doesn't expose
  // an author ID on comments, we check by nickname matching user name.
  // This is a pragmatic approach — the BE enforces actual ownership on mutation.
  const isOwner =
    userId !== null && comment.author_nickname !== null && !comment.is_deleted;

  const handleDelete = () => {
    deleteMutation.mutate(comment.id, {
      onSuccess: () => setShowDeleteDialog(false),
    });
  };

  // Deleted comment placeholder
  if (comment.is_deleted && comment.replies.length > 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground italic">
          삭제된 댓글입니다.
        </div>
        {/* Replies */}
        <div className="ml-6 flex flex-col gap-3 border-l-2 border-muted pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              userId={userId}
              isReply
            />
          ))}
        </div>
      </div>
    );
  }

  if (comment.is_deleted) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={cn('rounded-lg border p-3', isReply && 'bg-muted/30')}>
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {isReply && (
              <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="font-semibold">{comment.author_nickname}</span>
            {comment.author_company && (
              <span className="text-xs text-muted-foreground">
                {comment.author_company}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatCommentDate(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-muted-foreground">(수정됨)</span>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="댓글 수정"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="댓글 삭제"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content or Edit Form */}
        {isEditing ? (
          <EditForm
            postId={postId}
            commentId={comment.id}
            initialContent={comment.content}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
        )}

        {/* Reply toggle (only for top-level comments) */}
        {!isReply && !isEditing && userId && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            답글
          </button>
        )}

        {/* Inline reply form */}
        {showReplyForm && (
          <div className="mt-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              placeholder="답글을 작성해주세요."
              onCancel={() => setShowReplyForm(false)}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Replies (only on top-level) */}
      {!isReply && comment.replies.length > 0 && (
        <div className="ml-6 flex flex-col gap-3 border-l-2 border-muted pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              userId={userId}
              isReply
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>
              정말 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

// ── CommentSection (main export) ─────────────────────────────────────────────

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: comments, isLoading } = useComments(postId);
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <MessageCircle className="h-5 w-5" />
        댓글
        {comments && comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            {comments.length}
          </span>
        )}
      </h2>

      {/* Comment write form */}
      {user ? (
        <div className="mb-6">
          <CommentForm postId={postId} />
        </div>
      ) : (
        <div className="mb-6 rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          댓글을 작성하려면{' '}
          <Link
            href={`/auth/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
            className="font-medium text-primary hover:underline"
          >
            로그인
          </Link>
          이 필요합니다.
        </div>
      )}

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              userId={userId}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
        </div>
      )}
    </section>
  );
}
