import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/* ── Card Container ── */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

/* ── Card Header ── */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

/* ── Card Title ── */
const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

/* ── Card Description ── */
const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

/* ── Card Content ── */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

/* ── Card Footer ── */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

/* ── Card Image ── */
const CardImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { src: string; alt: string; aspectRatio?: string }
>(({ className, src, alt, aspectRatio = '16/9', ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative overflow-hidden rounded-t-xl', className)}
    style={{ aspectRatio }}
    {...props}
  >
    <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
  </div>
));
CardImage.displayName = 'CardImage';

/* ── Product Card (제품카드) ── */
interface ProductCardProps {
  image?: string;
  title: string;
  description?: string;
  price?: string;
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function ProductCard({ image, title, description, price, badge, className, onClick }: ProductCardProps) {
  return (
    <Card
      className={cn('cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5', className)}
      onClick={onClick}
    >
      {image && <CardImage src={image} alt={title} />}
      <CardHeader className="pb-2">
        {badge && <div className="mb-1">{badge}</div>}
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
      </CardHeader>
      {price && (
        <CardFooter>
          <span className="text-lg font-bold text-primary">{price}</span>
        </CardFooter>
      )}
    </Card>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardImage, ProductCard };
