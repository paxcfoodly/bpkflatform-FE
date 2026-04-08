/**
 * BPK Hub — PostListItem
 * 커뮤니티 게시글 목록 아이템 카드.
 */
'use client';

import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Eye,
  Pin,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { PostListItem as PostListItemType, BoardType } from '@/lib/api/community';

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

function formatDate(dateStr: string): string {
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

interface PostListItemProps {
  post: PostListItemType;
  onScrapToggle?: (id: string) => void;
  isScrapLoading?: boolean;
  isLoggedIn?: boolean;
}

export function PostListItem({
  post,
  onScrapToggle,
  isScrapLoading,
  isLoggedIn,
}: PostListItemProps) {
  const boardType = post.board_type as BoardType;

  return (
    <Link
      href={`/community/${boardType.toLowerCase()}/${post.id}`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 sm:flex-row sm:items-start sm:gap-4 sm:p-5"
    >
      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Top Row: Board Badge + Pin + Title */}
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
              BOARD_COLORS[boardType],
            )}
          >
            {BOARD_LABELS[boardType]}
          </span>
          {post.is_pinned && (
            <Pin className="h-3.5 w-3.5 shrink-0 text-primary" />
          )}
        </div>

        <h3 className="mb-1 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors sm:text-base">
          {post.title}
        </h3>

        {/* Author + Date */}
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{post.author_nickname}</span>
          {post.author_company && (
            <>
              <span>·</span>
              <span>{post.author_company}</span>
            </>
          )}
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.view_count}
          </span>
          <span
            className={cn(
              'flex items-center gap-1',
              post.is_liked && 'text-red-500',
            )}
          >
            <Heart
              className={cn('h-3.5 w-3.5', post.is_liked && 'fill-current')}
            />
            {post.like_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {post.comment_count}
          </span>
        </div>
      </div>

      {/* Scrap Button */}
      {onScrapToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onScrapToggle(post.id);
          }}
          disabled={isScrapLoading}
          className={cn(
            'shrink-0 self-start rounded-md p-1.5 transition-colors',
            post.is_scrapped
              ? 'text-primary hover:text-primary/80'
              : 'text-muted-foreground hover:text-foreground',
            isScrapLoading && 'opacity-50',
          )}
          aria-label={post.is_scrapped ? '스크랩 해제' : '스크랩'}
        >
          {post.is_scrapped ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      )}
    </Link>
  );
}
