/**
 * BPK Hub — Announcement Detail Page (/info/announcements/[id])
 * Shows full announcement info, source link, D-Day badge, scrap button.
 */
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Calendar,
  Building2,
  Bookmark,
  BookmarkCheck,
  Share2,
  Clock,
} from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { DDayBadge, Badge, CategoryTag } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { useAnnouncement, useToggleScrap } from '@/hooks/use-announcements';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

/** 날짜 포맷 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 공유 핸들러 */
function handleShare(title: string) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({
      title: `${title} - BPK Hub`,
      url: window.location.href,
    });
  } else if (typeof navigator !== 'undefined') {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 클립보드에 복사되었습니다.');
  }
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const announcementId = params.id as string;

  const { data: announcement, isLoading, isError, error } =
    useAnnouncement(announcementId);
  const scrapMutation = useToggleScrap();
  const user = useAuthStore((s) => s.user);

  const handleScrapToggle = () => {
    if (!user) {
      router.push(
        `/auth/login?redirect=/info/announcements/${announcementId}`,
      );
      return;
    }
    scrapMutation.mutate(announcementId);
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
  if (isError || !announcement) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-lg font-semibold text-destructive">
            공고 정보를 불러올 수 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : '잠시 후 다시 시도해주세요.'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/info/announcements')}
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
          { label: '공고/지원사업', href: '/info/announcements' },
          { label: announcement.title, href: `/info/announcements/${announcement.id}` },
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
          {announcement.d_day !== null && announcement.d_day !== undefined ? (
            <DDayBadge daysLeft={announcement.d_day} />
          ) : announcement.status === 'CLOSED' ? (
            <Badge variant="secondary">마감</Badge>
          ) : null}
          {announcement.category && (
            <CategoryTag label={announcement.category} />
          )}
          {announcement.status === 'OPEN' && (
            <Badge variant="success">진행중</Badge>
          )}
          {announcement.status === 'UPCOMING' && (
            <Badge variant="info">예정</Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold sm:text-3xl">
          {announcement.title}
        </h1>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            {announcement.organization}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            조회 {announcement.view_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            수집일 {formatDate(announcement.collected_at)}
          </span>
          <button
            onClick={() => handleShare(announcement.title)}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Share2 className="h-4 w-4" />
            공유
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="mb-6 rounded-lg border bg-muted/30 p-5">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          요약 정보
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">기관</p>
            <p className="font-medium">{announcement.organization}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">분야</p>
            <p className="font-medium">{announcement.category || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">접수 시작</p>
            <p className="font-medium">{formatDate(announcement.start_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">접수 마감</p>
            <p className="font-medium">{formatDate(announcement.end_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">상태</p>
            <p className="font-medium">
              {announcement.status === 'OPEN'
                ? '진행중'
                : announcement.status === 'CLOSED'
                  ? '마감'
                  : announcement.status === 'UPCOMING'
                    ? '예정'
                    : announcement.status}
            </p>
          </div>
          {announcement.d_day_label && (
            <div>
              <p className="text-xs text-muted-foreground">남은 기간</p>
              <p className="font-medium">{announcement.d_day_label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        {/* Source link */}
        <a
          href={announcement.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="cta" size="lg" className="w-full">
            <ExternalLink className="h-5 w-5" />
            원문 보기 (기업마당)
          </Button>
        </a>

        {/* Scrap button */}
        <Button
          variant={announcement.is_scrapped ? 'primary' : 'outline'}
          size="lg"
          onClick={handleScrapToggle}
          loading={scrapMutation.isPending}
          className="sm:w-auto"
        >
          {announcement.is_scrapped ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
          {announcement.is_scrapped ? '스크랩 해제' : '스크랩'}
        </Button>
      </div>

      {/* Content */}
      {announcement.content && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">공고 내용</h2>
          <div className="prose prose-sm max-w-none rounded-lg border p-6 text-muted-foreground whitespace-pre-line">
            {announcement.content}
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <Link
          href="/info/announcements"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
        <a
          href={announcement.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          원문 보기
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
