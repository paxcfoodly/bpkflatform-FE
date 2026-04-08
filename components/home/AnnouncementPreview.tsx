'use client';

import Link from 'next/link';
import { Megaphone, Bookmark, BookmarkCheck, Building2 } from 'lucide-react';
import { DDayBadge, Badge } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAnnouncements, useToggleScrap } from '@/hooks/use-announcements';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import type { AnnouncementListItem } from '@/lib/api/announcements';

/** 날짜 포맷 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  });
}

function ScrapIcon({
  item,
  onToggle,
}: {
  item: AnnouncementListItem;
  onToggle: (id: string) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/auth/login?redirect=/');
      return;
    }
    onToggle(item.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        item.is_scrapped
          ? 'text-primary hover:text-primary/80'
          : 'text-muted-foreground hover:text-foreground'
      }
      aria-label={item.is_scrapped ? '스크랩 해제' : '스크랩'}
    >
      {item.is_scrapped ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </button>
  );
}

export function AnnouncementPreview() {
  const { data, isLoading, isError } = useAnnouncements({
    page: 1,
    limit: 4,
    sort_by: 'end_date',
    sort_order: 'asc',
    status: 'OPEN',
  });

  const scrapMutation = useToggleScrap();
  const announcements = data?.data ?? [];

  // Loading skeleton
  if (isLoading) {
    return (
      <div aria-label="최근 공고">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error or empty — fall back gracefully
  if (isError || announcements.length === 0) {
    return (
      <div aria-label="최근 공고">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold md:text-xl flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            정부 공고 · 지원사업
          </h2>
          <Link
            href="/info/announcements"
            className="text-sm text-primary hover:underline"
          >
            전체보기 →
          </Link>
        </div>
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>현재 진행중인 공고가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div aria-label="최근 공고">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold md:text-xl flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          정부 공고 · 지원사업
        </h2>
        <Link
          href="/info/announcements"
          className="text-sm text-primary hover:underline"
        >
          전체보기 →
        </Link>
      </div>
      <div className="grid gap-3">
        {announcements.map((ann) => (
          <Link
            key={ann.id}
            href={`/info/announcements/${ann.id}`}
            className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            {/* D-Day badge */}
            {ann.d_day !== null && ann.d_day !== undefined ? (
              <DDayBadge
                daysLeft={ann.d_day}
                className="mt-0.5 shrink-0"
              />
            ) : ann.status === 'CLOSED' ? (
              <Badge variant="secondary" className="mt-0.5 shrink-0">
                마감
              </Badge>
            ) : null}

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                {ann.title}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {ann.organization} · 마감 {formatDate(ann.end_date)}
              </p>
            </div>

            <ScrapIcon
              item={ann}
              onToggle={(id) => scrapMutation.mutate(id)}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
