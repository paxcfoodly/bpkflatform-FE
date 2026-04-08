import { Skeleton, SkeletonCard } from '@/components/ui';

/* ── HeroBanner Skeleton ── */
export function HeroBannerSkeleton() {
  return (
    <div className="w-full h-[320px] lg:h-[480px] bg-muted animate-pulse" aria-hidden="true">
      <div className="flex h-full flex-col items-center justify-center gap-4 max-w-7xl mx-auto px-4">
        <Skeleton className="h-10 w-2/3 md:w-1/3" />
        <Skeleton className="h-5 w-3/4 md:w-1/2" />
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-12 w-32 rounded-lg" />
          <Skeleton className="h-12 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ── ServiceCards Skeleton ── */
export function ServiceCardsSkeleton() {
  return (
    <div className="py-12" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="h-7 w-32 mb-6" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 flex flex-col items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── ProductSlider Skeleton ── */
export function ProductSliderSkeleton() {
  return (
    <div className="py-12" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="h-7 w-32 mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-none w-[280px] lg:w-[calc(25%-12px)]">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MarketTicker Skeleton ── */
export function MarketTickerSkeleton() {
  return (
    <div className="border-y bg-muted/30 py-3" aria-hidden="true">
      <div className="flex gap-8 max-w-7xl mx-auto px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-40 shrink-0" />
        ))}
      </div>
    </div>
  );
}

/* ── AnnouncementPreview Skeleton ── */
export function AnnouncementPreviewSkeleton() {
  return (
    <div className="py-12" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="h-7 w-40 mb-6" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
              <Skeleton className="h-6 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CommunityPreview Skeleton ── */
export function CommunityPreviewSkeleton() {
  return (
    <div className="py-12 bg-muted/30" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="h-7 w-40 mb-6" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-4">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── StatCounter Skeleton ── */
export function StatCounterSkeleton() {
  return (
    <div className="py-16 bg-muted/20" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CTABanner Skeleton ── */
export function CTABannerSkeleton() {
  return (
    <div className="py-16 md:py-20 bg-muted" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-12 w-36 rounded-lg" />
          <Skeleton className="h-12 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ── PartnerSlider Skeleton ── */
export function PartnerSliderSkeleton() {
  return (
    <div className="py-12 border-t" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="h-5 w-48 mx-auto mb-8" />
        <div className="flex gap-8 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-[150px] md:w-[180px] shrink-0 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── NewsPreview Skeleton ── */
export function NewsPreviewSkeleton() {
  return (
    <div className="py-12" aria-hidden="true">
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton className="h-7 w-36 mb-6" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
