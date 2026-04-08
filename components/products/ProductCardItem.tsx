/**
 * BPK Hub — Product Card Component
 * Displays a single product as a card in the product grid.
 */
'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { ProductListItem } from '@/lib/api/products';

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
}

/** 가격 포맷 (만원 단위) */
function formatPrice(price: number | null, priceLabel: string | null): string {
  if (priceLabel) return priceLabel;
  if (price == null) return '가격 문의';
  if (price >= 10000) {
    const man = Math.floor(price / 10000);
    const remainder = price % 10000;
    return remainder > 0
      ? `${man.toLocaleString()}만 ${remainder.toLocaleString()}원`
      : `${man.toLocaleString()}만원`;
  }
  return `${price.toLocaleString()}원`;
}

export function ProductCardItem({ product, className }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {product.thumbnail_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        {product.category_name && (
          <Badge
            variant="secondary"
            className="absolute left-2 top-2 bg-background/80 backdrop-blur-sm text-xs"
          >
            {product.category_name}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {product.subtitle && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {product.subtitle}
          </p>
        )}

        <div className="mt-auto pt-3">
          <p className="text-base font-bold text-primary">
            {formatPrice(product.price, product.price_label)}
          </p>
        </div>

        {/* View count */}
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span>조회 {product.view_count.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
