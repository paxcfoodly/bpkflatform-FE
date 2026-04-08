'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { fetchMarketPrices, COMMODITY_META } from '@/lib/api/market';
import type { PriceItem } from '@/lib/api/market';

/** Fallback data shown while API loads or on error */
const FALLBACK_ITEMS = [
  { label: '쌀', price: '—', unit: '', change: 0, direction: 'stable' as const },
  { label: '우유', price: '—', unit: '', change: 0, direction: 'stable' as const },
  { label: '달걀', price: '—', unit: '', change: 0, direction: 'stable' as const },
  { label: '돼지고기', price: '—', unit: '', change: 0, direction: 'stable' as const },
  { label: '닭고기', price: '—', unit: '', change: 0, direction: 'stable' as const },
];

function mapPriceToTicker(item: PriceItem) {
  const meta = COMMODITY_META[item.commodity] ?? { emoji: '📦' };
  return {
    label: item.label,
    emoji: meta.emoji,
    price: item.price !== null ? `₩${item.price.toLocaleString('ko-KR')}` : '—',
    unit: item.unit ? `/${item.unit}` : '',
    change: item.change_rate ?? 0,
    direction: item.direction,
  };
}

export function MarketTicker() {
  const [items, setItems] = useState<ReturnType<typeof mapPriceToTicker>[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchMarketPrices();
        if (cancelled) return;
        // Only show items with actual prices
        const available = res.data
          .filter((d) => d.price !== null)
          .map(mapPriceToTicker);
        setItems(available.length > 0 ? available : FALLBACK_ITEMS.map((f) => ({ ...f, emoji: '📦' })));
      } catch {
        if (!cancelled) {
          setItems(FALLBACK_ITEMS.map((f) => ({ ...f, emoji: '📦' })));
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Duplicate items for seamless infinite scroll loop
  const displayItems = loaded ? [...items, ...items] : [...FALLBACK_ITEMS.map((f) => ({ ...f, emoji: '📦' })), ...FALLBACK_ITEMS.map((f) => ({ ...f, emoji: '📦' }))];

  return (
    <section
      className="border-y bg-muted/30 py-3 overflow-hidden"
      aria-label="실시간 원자재 시세"
    >
      <div className="relative flex items-center">
        {/* Title label — solid background keeps it above the scrolling ticker */}
        <div className="relative z-10 flex-shrink-0 flex items-center bg-background/95 pr-2">
          <Link
            href="/info/market"
            className="px-4 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
          >
            원자재 시세 →
          </Link>
          {/* Fade-out edge */}
          <div className="w-4 h-full bg-gradient-to-r from-background/95 to-transparent" />
        </div>

        {/* Scrolling ticker */}
        <div
          className="flex w-max gap-8 motion-safe:animate-[ticker-scroll_30s_linear_infinite]"
          aria-live="off"
        >
          {displayItems.map((item, i) => (
            <div key={`${item.label}-${i}`} className="flex items-center gap-2 whitespace-nowrap text-sm">
              <span className="text-base">{item.emoji}</span>
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">
                {item.price}{item.unit}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  item.direction === 'up'
                    ? 'text-destructive'
                    : item.direction === 'down'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-muted-foreground',
                )}
              >
                {item.direction === 'up' ? '▲' : item.direction === 'down' ? '▼' : '—'}
                {item.change !== 0 ? `${Math.abs(item.change).toFixed(1)}%` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
