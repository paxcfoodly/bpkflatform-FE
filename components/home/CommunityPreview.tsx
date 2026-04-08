import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui';

const POSTS = [
  {
    id: '1',
    title: '굴삭기 일상점검 체크리스트 공유합니다',
    category: '정비/관리',
    likes: 128,
    comments: 34,
  },
  {
    id: '2',
    title: '2026년 건설기계 시장 전망 분석',
    category: '시장분석',
    likes: 95,
    comments: 22,
  },
  {
    id: '3',
    title: '중고 장비 구매 시 꼭 확인해야 할 5가지',
    category: '구매가이드',
    likes: 87,
    comments: 41,
  },
  {
    id: '4',
    title: '현장에서 자주 쓰는 안전 수칙 정리',
    category: '안전/규정',
    likes: 76,
    comments: 18,
  },
  {
    id: '5',
    title: '소형 굴삭기 vs 미니 굴삭기 비교 후기',
    category: '장비리뷰',
    likes: 64,
    comments: 29,
  },
];

export function CommunityPreview() {
  return (
    <section className="py-12 bg-muted/30" aria-label="커뮤니티 인기글">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold md:text-2xl">커뮤니티 인기글</h2>
          <Link
            href="/community"
            className="text-sm text-primary hover:underline"
          >
            전체보기 →
          </Link>
        </div>
        <div className="space-y-2">
          {POSTS.map((post, index) => (
            <div
              key={post.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <span className="text-lg font-bold text-muted-foreground w-6 text-center shrink-0">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold leading-snug line-clamp-1">
                  {post.title}
                </h3>
              </div>
              <Badge variant="secondary" className="shrink-0 hidden sm:inline-flex">
                {post.category}
              </Badge>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {post.comments}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
