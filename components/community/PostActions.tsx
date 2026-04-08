/**
 * BPK Hub — PostActions
 * 좋아요·스크랩·공유 토글 버튼 bar for post detail page.
 */
'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Heart,
  Bookmark,
  BookmarkCheck,
  Share2,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToggleLike, useToggleScrap } from '@/hooks/use-community';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface PostActionsProps {
  postId: string;
  isLiked: boolean;
  likeCount: number;
  isScrapped: boolean;
}

export function PostActions({
  postId,
  isLiked,
  likeCount,
  isScrapped,
}: PostActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const likeMutation = useToggleLike(postId);
  const scrapMutation = useToggleScrap();

  const requireAuth = (action: () => void) => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    action();
  };

  const handleLike = () => requireAuth(() => likeMutation.mutate());
  const handleScrap = () => requireAuth(() => scrapMutation.mutate(postId));

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: document.title, url });
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Like */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={cn(
          'gap-1.5',
          isLiked && 'text-red-500 hover:text-red-600',
        )}
        aria-label={isLiked ? '좋아요 취소' : '좋아요'}
      >
        <Heart
          className={cn('h-4 w-4', isLiked && 'fill-current')}
        />
        <span className="text-sm">{likeCount}</span>
      </Button>

      {/* Scrap */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleScrap}
        className={cn(
          'gap-1.5',
          isScrapped && 'text-primary',
        )}
        aria-label={isScrapped ? '스크랩 해제' : '스크랩'}
      >
        {isScrapped ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        <span className="text-sm">{isScrapped ? '스크랩됨' : '스크랩'}</span>
      </Button>

      {/* Share */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="gap-1.5"
        aria-label="공유"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm">공유</span>
      </Button>
    </div>
  );
}
