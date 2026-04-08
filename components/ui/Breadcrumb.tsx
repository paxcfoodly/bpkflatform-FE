import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Breadcrumb Root ── */
function Breadcrumb({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn('', className)}
      {...props}
    />
  );
}
Breadcrumb.displayName = 'Breadcrumb';

/* ── Breadcrumb List ── */
function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      className={cn(
        'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
        className,
      )}
      {...props}
    />
  );
}
BreadcrumbList.displayName = 'BreadcrumbList';

/* ── Breadcrumb Item ── */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}
BreadcrumbItem.displayName = 'BreadcrumbItem';

/* ── Breadcrumb Link ── */
interface BreadcrumbLinkProps extends React.ComponentProps<typeof Link> {
  isCurrentPage?: boolean;
}

function BreadcrumbLink({ className, isCurrentPage, ...props }: BreadcrumbLinkProps) {
  if (isCurrentPage) {
    return (
      <span
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn('font-medium text-foreground', className)}
      >
        {props.children}
      </span>
    );
  }
  return (
    <Link
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
}
BreadcrumbLink.displayName = 'BreadcrumbLink';

/* ── Breadcrumb Separator ── */
function BreadcrumbSeparator({ className, children, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:h-3.5 [&>svg]:w-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

/* ── Convenience: render full breadcrumb from items ── */
interface BreadcrumbPath {
  label: string;
  href: string;
}

function BreadcrumbNav({ items, className }: { items: BreadcrumbPath[]; className?: string }) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                <BreadcrumbLink href={item.href} isCurrentPage={isLast}>
                  {item.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbNav,
};
