/**
 * BPK Hub — Product Detail Page (/products/[id])
 * Image gallery, specs table, features, YouTube embed, CTA buttons.
 */
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Bot,
  Eye,
  Calendar,
  Share2,
  Phone,
} from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ImageGallery, type GalleryImage } from '@/components/ui/ImageGallery';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { useProduct } from '@/hooks/use-products';

/** 가격 포맷 */
function formatPrice(price: number | null, priceLabel: string | null): string {
  if (priceLabel) return priceLabel;
  if (price == null) return '가격 문의';
  return `${price.toLocaleString()}원`;
}

/** 날짜 포맷 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** YouTube 임베드 ID 추출 */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Share handler */
function handleShare(name: string) {
  if (navigator.share) {
    navigator.share({
      title: `${name} - BPK Hub`,
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 클립보드에 복사되었습니다.');
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: product, isLoading, isError, error } = useProduct(productId);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-5 w-48" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <SkeletonText lines={4} />
            <Skeleton className="mt-6 h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-lg font-semibold text-destructive">
            제품 정보를 불러올 수 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/products')}
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // Build gallery images
  const galleryImages: GalleryImage[] =
    product.images.length > 0
      ? product.images.map((img) => ({
          src: img.url,
          alt: img.alt_text || product.name,
        }))
      : product.thumbnail_url
        ? [{ src: product.thumbnail_url, alt: product.name }]
        : [];

  const youtubeId = product.video_url ? getYouTubeId(product.video_url) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: '홈', href: '/' },
          { label: '장비 마켓', href: '/products' },
          { label: product.category.name, href: `/products?category=${product.category.id}` },
          { label: product.name, href: `/products/${product.id}` },
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

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Gallery */}
        <div>
          {galleryImages.length > 0 ? (
            <ImageGallery images={galleryImages} />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
              <p className="text-muted-foreground">이미지 없음</p>
            </div>
          )}

          {/* YouTube embed */}
          {youtubeId && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold">제품 영상</h3>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={`${product.name} 영상`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div>
          {/* Category + Status */}
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary">{product.category.name}</Badge>
            {product.status === 'ACTIVE' && (
              <Badge variant="success">판매중</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
          {product.subtitle && (
            <p className="mt-2 text-lg text-muted-foreground">
              {product.subtitle}
            </p>
          )}

          {/* Price */}
          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">가격</p>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(product.price, product.price_label)}
            </p>
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              조회 {product.view_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(product.created_at)}
            </span>
            <button
              onClick={() => handleShare(product.name)}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Share2 className="h-4 w-4" />
              공유
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/quote?productId=${product.id}&productName=${encodeURIComponent(product.name)}`} className="flex-1">
              <Button variant="cta" size="lg" className="w-full">
                <FileText className="h-5 w-5" />
                견적 문의하기
              </Button>
            </Link>
            <Link href={`/ai-matching?productId=${product.id}`} className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <Bot className="h-5 w-5" />
                AI 매칭 분석
              </Button>
            </Link>
          </div>

          {/* Quick contact */}
          <div className="mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">빠른 상담:</span>
            <a
              href="tel:02-0000-0000"
              className="font-semibold text-primary hover:underline"
            >
              02-0000-0000
            </a>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">제품 소개</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
              {product.description}
            </div>
          </div>

          {/* Specs Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">제품 사양</h2>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value], idx) => (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? 'bg-muted/30' : ''}
                      >
                        <th className="w-1/3 border-r px-4 py-3 text-left font-medium text-muted-foreground">
                          {key}
                        </th>
                        <td className="px-4 py-3">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Keywords */}
          {product.ai_keywords && product.ai_keywords.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">관련 키워드</h2>
              <div className="flex flex-wrap gap-2">
                {product.ai_keywords.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs">
                    #{kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA (mobile sticky) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background p-4 sm:hidden">
        <div className="flex gap-2">
          <Link href={`/quote?productId=${product.id}&productName=${encodeURIComponent(product.name)}`} className="flex-1">
            <Button variant="cta" size="lg" className="w-full">
              <FileText className="h-5 w-5" />
              견적 문의
            </Button>
          </Link>
          <Link href={`/ai-matching?productId=${product.id}`}>
            <Button variant="outline" size="lg">
              <Bot className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom spacer for mobile sticky CTA */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
