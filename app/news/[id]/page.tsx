/**
 * BPK Hub — News Detail Page (/news/[id])
 * Shows full news content with Tiptap HTML rendering.
 */
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Eye,
  Calendar,
  Share2,
  Pin,
} from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { useNewsDetail } from '@/hooks/use-news';

/** 날짜 포맷 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 유형 뱃지 variant 매핑 */
function typeBadge(type: string) {
  switch (type) {
    case 'NEWS':
      return { label: '뉴스', variant: 'info' as const };
    case 'NOTICE':
      return { label: '공지', variant: 'warning' as const };
    default:
      return { label: type, variant: 'secondary' as const };
  }
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

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id as string;

  const { data: news, isLoading, isError, error } = useNewsDetail(newsId);

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
  if (isError || !news) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-lg font-semibold text-destructive">
            뉴스 정보를 불러올 수 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : '잠시 후 다시 시도해주세요.'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/news')}
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const badge = typeBadge(news.type);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: '홈', href: '/' },
          { label: '뉴스·공지', href: '/news' },
          { label: news.title, href: `/news/${news.id}` },
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
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {news.is_pinned && (
            <span className="flex items-center gap-0.5 text-xs text-primary font-medium">
              <Pin className="h-3 w-3" />
              고정
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold sm:text-3xl">{news.title}</h1>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(news.published_at || news.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            조회 {news.view_count.toLocaleString()}
          </span>
          <button
            onClick={() => handleShare(news.title)}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Share2 className="h-4 w-4" />
            공유
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      {news.thumbnail_url && (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={news.thumbnail_url}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      {/* Summary */}
      {news.summary && (
        <div className="mb-6 rounded-lg border bg-muted/30 p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {news.summary}
          </p>
        </div>
      )}

      {/* Content — Tiptap HTML rendered via dangerouslySetInnerHTML */}
      {news.content && (
        <div className="mb-8">
          <div
            className="prose prose-sm max-w-none rounded-lg border p-6"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }}
          />
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-8 border-t pt-6">
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
