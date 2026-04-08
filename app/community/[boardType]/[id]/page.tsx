/**
 * BPK Hub — Post Detail Page (/community/[boardType]/[id])
 * 게시글 상세 + 댓글 섹션 + 좋아요/스크랩 액션.
 * Server wrapper + Client inner component pattern (Next.js 14 useParams + Suspense).
 */
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Skeleton';
import PostDetailContent from './PostDetailContent';

interface PageProps {
  params: Promise<{ boardType: string; id: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { boardType, id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <PostDetailContent boardType={boardType} postId={id} />
    </Suspense>
  );
}
