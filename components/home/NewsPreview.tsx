import Link from 'next/link';
import { Newspaper } from 'lucide-react';

const NEWS_ITEMS = [
  {
    id: '1',
    title: '2026년 상반기 건설기계 시장 동향 보고서 발간',
    date: '2026-04-01',
    category: '시장동향',
  },
  {
    id: '2',
    title: 'BPK 플랫폼, AI 매칭 서비스 정식 오픈',
    date: '2026-03-28',
    category: '공지사항',
  },
  {
    id: '3',
    title: '건설기계 안전관리 강화 법안 시행 안내',
    date: '2026-03-25',
    category: '규정/법안',
  },
  {
    id: '4',
    title: '제5회 중장비 박람회 사전등록 시작',
    date: '2026-03-22',
    category: '이벤트',
  },
];

export function NewsPreview() {
  return (
    <div aria-label="뉴스·공지">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold md:text-xl">뉴스 · 공지</h2>
        <Link
          href="/news"
          className="text-sm text-primary hover:underline"
        >
          전체보기 →
        </Link>
      </div>
      <div className="grid gap-3">
        {NEWS_ITEMS.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Newspaper className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold leading-snug line-clamp-1">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.category} · {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
