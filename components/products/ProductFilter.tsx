/**
 * BPK Hub — Product Filter (Category Tabs + Sort)
 * Horizontal scrollable category tabs with sort dropdown.
 */
'use client';

import { cn } from '@/lib/utils';
import { LayoutGrid, ArrowUpDown } from 'lucide-react';
import type { ProductCategory } from '@/lib/api/products';

interface ProductFilterProps {
  categories: ProductCategory[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  totalCount?: number;
}

const SORT_OPTIONS = [
  { label: '최신순', sortBy: 'created_at', sortOrder: 'desc' as const },
  { label: '인기순', sortBy: 'view_count', sortOrder: 'desc' as const },
  { label: '가격 낮은순', sortBy: 'price', sortOrder: 'asc' as const },
  { label: '가격 높은순', sortBy: 'price', sortOrder: 'desc' as const },
  { label: '이름순', sortBy: 'name', sortOrder: 'asc' as const },
];

export function ProductFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  sortOrder,
  onSortChange,
  totalCount,
}: ProductFilterProps) {
  const currentSort = SORT_OPTIONS.find(
    (o) => o.sortBy === sortBy && o.sortOrder === sortOrder,
  );

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
            !selectedCategory
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          전체
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              selectedCategory === cat.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {cat.name}
            <span className="text-xs opacity-70">({cat.product_count})</span>
          </button>
        ))}
      </div>

      {/* Sort & Count row */}
      <div className="flex items-center justify-between">
        {totalCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            총 <span className="font-semibold text-foreground">{totalCount}</span>개 제품
          </p>
        )}

        <div className="relative ml-auto">
          <div className="flex items-center gap-1">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split(':') as [string, 'asc' | 'desc'];
                onSortChange(newSortBy, newSortOrder);
              }}
              className="appearance-none border-none bg-transparent py-1 pr-6 text-sm font-medium text-foreground outline-none cursor-pointer"
              aria-label="정렬 기준"
            >
              {SORT_OPTIONS.map((opt) => (
                <option
                  key={`${opt.sortBy}:${opt.sortOrder}`}
                  value={`${opt.sortBy}:${opt.sortOrder}`}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
