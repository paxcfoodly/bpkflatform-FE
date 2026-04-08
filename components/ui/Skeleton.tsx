import * as React from 'react';
import { cn } from '@/lib/utils';

/* ── Base Skeleton ── */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/* ── Skeleton Text Lines ── */
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

/* ── Skeleton Card ── */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-xl border bg-card p-6', className)}
      aria-hidden="true"
    >
      <Skeleton className="mb-4 aspect-video w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="mt-4 h-6 w-1/3" />
    </div>
  );
}

/* ── Skeleton Avatar ── */
function SkeletonAvatar({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' };
  return <Skeleton className={cn('rounded-full', sizeMap[size], className)} />;
}

/* ── Skeleton Table Row ── */
function SkeletonTableRow({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 py-3', className)} aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

/* ── Full-page Loading Spinner ── */
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)} role="status" aria-label="로딩 중">
      <svg
        className="h-8 w-8 animate-spin text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">로딩 중</span>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonTableRow, LoadingSpinner };
