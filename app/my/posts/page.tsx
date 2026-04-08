/**
 * BPK Hub — 내 게시글 페이지 (P30)
 * /my/posts — board_type 필터 + Pagination
 * useSearchParams → Suspense 래핑 필수
 */
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText, Eye, MessageCircle, Heart } from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  ControlledPagination,
  Tabs,
  LoadingSpinner,
} from '@/components/ui';
import { useMyPosts } from '@/hooks/use-my';

const BOARD_TYPE_TABS = [
  { label: '전체', value: '' },
  { label: '자유', value: 'FREE' },
  { label: '질문', value: 'QUESTION' },
  { label: '정보', value: 'INFO' },
  { label: '후기', value: 'REVIEW' },
] as const;

const BOARD_LABEL: Record<string, string> = {
  FREE: '자유',
  QUESTION: '질문',
  INFO: '정보',
  REVIEW: '후기',
};

const BOARD_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  FREE: 'secondary',
  QUESTION: 'default',
  INFO: 'outline',
  REVIEW: 'secondary',
};

function PostsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const boardType = searchParams.get('board_type') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const { data, isLoading, error } = useMyPosts({
    board_type: boardType || undefined,
    page,
    limit: 10,
  });

  const setParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/my/posts?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="py-20 text-center text-destructive">
        게시글 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">내 게시글</h1>

      <Tabs
        items={BOARD_TYPE_TABS.map((t) => ({ ...t }))}
        activeValue={boardType}
        onChange={(val) => setParams({ board_type: val, page: '1' })}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FileText className="mb-4 h-12 w-12 opacity-30" />
          <p>작성한 게시글이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((post) => (
              <Card
                key={post.id}
                className="transition-all hover:shadow-md"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={BOARD_VARIANT[post.board_type] ?? 'secondary'} className="shrink-0">
                        {BOARD_LABEL[post.board_type] ?? post.board_type}
                      </Badge>
                      <span className="truncate text-sm font-medium">
                        {post.title}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {post.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {post.like_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post.comment_count}
                      </span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <ControlledPagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(p) => setParams({ page: String(p) })}
          />
        </>
      )}
    </div>
  );
}

/**
 * 내 게시글 페이지 — useSearchParams → Suspense 래핑 필수.
 */
export default function PostsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PostsInner />
    </Suspense>
  );
}
