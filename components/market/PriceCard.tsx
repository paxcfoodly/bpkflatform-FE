'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import type { PriceItem } from '@/lib/api/market';
import { COMMODITY_META } from '@/lib/api/market';

interface PriceCardProps {
  item: PriceItem;
  selected?: boolean;
  onClick?: () => void;
}

/** 원자재 시세 카드 — 현재가 + 등락폭 + 등락률 표시 */
export function PriceCard({ item, selected, onClick }: PriceCardProps) {
  const meta = COMMODITY_META[item.commodity] ?? { emoji: '📦', color: '#6b7280' };
  const isAvailable = item.price !== null;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5',
        selected && 'ring-2 ring-primary shadow-md',
        !isAvailable && 'opacity-60',
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`${item.label} 시세 카드`}
    >
      <CardContent className="p-4">
        {/* Header: emoji + label + stale badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={item.label}>
              {meta.emoji}
            </span>
            <span className="font-semibold text-sm">{item.label}</span>
          </div>
          {item.stale && (
            <span className="text-[10px] bg-warning/20 text-warning-foreground px-1.5 py-0.5 rounded-full">
              캐시
            </span>
          )}
        </div>

        {isAvailable ? (
          <>
            {/* Price */}
            <div className="text-lg font-bold mb-1">
              ₩{item.price!.toLocaleString('ko-KR')}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                /{item.unit}
              </span>
            </div>

            {/* Change indicator */}
            <div className="flex items-center gap-1.5">
              <DirectionBadge direction={item.direction} />
              <span
                className={cn(
                  'text-xs font-medium',
                  item.direction === 'up' && 'text-destructive',
                  item.direction === 'down' && 'text-blue-600 dark:text-blue-400',
                  item.direction === 'stable' && 'text-muted-foreground',
                )}
              >
                {item.change_amount !== null
                  ? `${item.change_amount > 0 ? '+' : ''}${item.change_amount.toLocaleString('ko-KR')}원`
                  : '—'}
              </span>
              {item.change_rate !== null && (
                <span
                  className={cn(
                    'text-xs',
                    item.direction === 'up' && 'text-destructive',
                    item.direction === 'down' && 'text-blue-600 dark:text-blue-400',
                    item.direction === 'stable' && 'text-muted-foreground',
                  )}
                >
                  ({item.change_rate > 0 ? '+' : ''}{item.change_rate.toFixed(1)}%)
                </span>
              )}
              {item.comparison_basis && (
                <span className="text-[10px] text-muted-foreground">
                  {item.comparison_basis}
                </span>
              )}
            </div>

            {/* Date */}
            <div className="text-[10px] text-muted-foreground mt-2">
              기준: {item.date}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground py-3">
            데이터 없음
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** ▲빨간 / ▼파란 / —회색 등락 방향 배지 */
function DirectionBadge({ direction }: { direction: string }) {
  if (direction === 'up') {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
        ▲
      </span>
    );
  }
  if (direction === 'down') {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
        ▼
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-bold">
      —
    </span>
  );
}
