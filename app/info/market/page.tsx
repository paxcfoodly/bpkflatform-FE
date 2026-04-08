'use client';

import { useState, useEffect } from 'react';
import { PriceCard } from '@/components/market/PriceCard';
import { TrendChart } from '@/components/market/TrendChart';
import { fetchMarketPrices } from '@/lib/api/market';
import type { PriceItem } from '@/lib/api/market';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MarketPage() {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrices() {
      try {
        const res = await fetchMarketPrices();
        setPrices(res.data);
        // Auto-select the first available commodity for the chart
        const first = res.data.find((d) => d.price !== null);
        if (first) setSelectedCommodity(first.commodity);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : '시세 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.',
        );
      } finally {
        setLoading(false);
      }
    }
    loadPrices();
  }, []);

  const selectedItem = prices.find((p) => p.commodity === selectedCommodity);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">원자재 시세</h1>
        <p className="mt-1 text-muted-foreground text-sm sm:text-base">
          주요 식품 원자재 8종의 현재 시세와 가격 추이를 확인하세요.
          <br className="hidden sm:block" />
          KAMIS(농산물유통정보) 기반 실시간 데이터입니다.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive mb-6">
          <p className="font-medium">⚠ 시세 조회 실패</p>
          <p className="mt-1 text-destructive/80">{error}</p>
          <button
            type="button"
            className="mt-2 text-xs underline hover:no-underline"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Price cards grid */}
      {!loading && prices.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
            {prices.map((item) => (
              <PriceCard
                key={item.commodity}
                item={item}
                selected={selectedCommodity === item.commodity}
                onClick={() => {
                  if (item.price !== null) {
                    setSelectedCommodity(item.commodity);
                  }
                }}
              />
            ))}
          </div>

          {/* Trend chart for selected commodity */}
          {selectedItem && (
            <div className="mt-8">
              <TrendChart
                commodity={selectedItem.commodity}
                label={selectedItem.label}
              />
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !error && prices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">시세 데이터가 없습니다</p>
          <p className="text-sm mt-1">잠시 후 다시 시도해주세요.</p>
        </div>
      )}
    </main>
  );
}
