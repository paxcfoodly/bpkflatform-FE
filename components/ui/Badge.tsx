import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        info: 'border-transparent bg-info text-info-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/* ── D-Day Badge ── */
interface DDayBadgeProps {
  daysLeft: number;
  className?: string;
}

function DDayBadge({ daysLeft, className }: DDayBadgeProps) {
  const variant = daysLeft <= 3 ? 'destructive' : daysLeft <= 7 ? 'warning' : 'info';
  const label = daysLeft === 0 ? 'D-Day' : daysLeft > 0 ? `D-${daysLeft}` : `D+${Math.abs(daysLeft)}`;
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

/* ── Status Badge ── */
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'closed' | 'draft';
  className?: string;
}

const STATUS_MAP: Record<StatusBadgeProps['status'], { label: string; variant: BadgeProps['variant'] }> = {
  active: { label: '진행중', variant: 'success' },
  pending: { label: '대기중', variant: 'warning' },
  closed: { label: '마감', variant: 'secondary' },
  draft: { label: '임시저장', variant: 'outline' },
};

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

/* ── Category Tag ── */
interface CategoryTagProps {
  label: string;
  className?: string;
  onClick?: () => void;
}

function CategoryTag({ label, className, onClick }: CategoryTagProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('cursor-pointer hover:bg-secondary/80', className)}
      onClick={onClick}
    >
      {label}
    </Badge>
  );
}

export { Badge, badgeVariants, DDayBadge, StatusBadge, CategoryTag };
