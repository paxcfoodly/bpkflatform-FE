import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './Button';

/* ── Pagination Root ── */
function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="페이지네이션"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}
Pagination.displayName = 'Pagination';

/* ── Pagination Content ── */
function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-row items-center gap-1', className)} {...props} />;
}
PaginationContent.displayName = 'PaginationContent';

/* ── Pagination Item ── */
function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('', className)} {...props} />;
}
PaginationItem.displayName = 'PaginationItem';

/* ── Pagination Link ── */
type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<'button'>;

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <button
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? 'primary' : 'outline',
          size: 'icon',
        }),
        'h-9 w-9',
        className,
      )}
      {...props}
    />
  );
}
PaginationLink.displayName = 'PaginationLink';

/* ── Previous ── */
function PaginationPrevious({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      aria-label="이전 페이지"
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        'gap-1 pl-2.5',
        className,
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>이전</span>
    </button>
  );
}
PaginationPrevious.displayName = 'PaginationPrevious';

/* ── Next ── */
function PaginationNext({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      aria-label="다음 페이지"
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        'gap-1 pr-2.5',
        className,
      )}
      {...props}
    >
      <span>다음</span>
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}
PaginationNext.displayName = 'PaginationNext';

/* ── Ellipsis ── */
function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">더 보기</span>
    </span>
  );
}
PaginationEllipsis.displayName = 'PaginationEllipsis';

/* ── Controlled Pagination ── */
interface ControlledPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function ControlledPagination({ currentPage, totalPages, onPageChange, className }: ControlledPaginationProps) {
  const getPages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== 'ellipsis') {
        pages.push('ellipsis');
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          />
        </PaginationItem>

        {getPages().map((page, idx) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  ControlledPagination,
};
