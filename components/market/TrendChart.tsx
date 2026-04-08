'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { fetchMarketTrends, COMMODITY_META } from '@/lib/api/market';
import type { TrendData } from '@/lib/api/market';

const PERIOD_TABS = [
  { key: 'daily' as const, label: '일간' },
  { key: 'weekly' as const, label: '주간' },
  { key: 'monthly' as const, label: '월간' },
];

interface TrendChartProps {
  commodity: string;
  label: string;
}

/** 원자재 가격 추이 라인차트 — 일간/주간/월간 탭 전환 */
export function TrendChart({ commodity, label }: TrendChartProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = COMMODITY_META[commodity] ?? { emoji: '📦', color: '#6b7280' };

  const loadTrend = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMarketTrends(commodity, period);
      setTrendData(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러올 수 없습니다.');
      setTrendData(null);
    } finally {
      setLoading(false);
    }
  }, [commodity, period]);

  useEffect(() => {
    loadTrend();
  }, [loadTrend]);

  // Format date labels for X axis
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (period === 'daily') return `${d.getMonth() + 1}/${d.getDate()}`;
    if (period === 'weekly') return `${d.getMonth() + 1}/${d.getDate()}`;
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span>{meta.emoji}</span>
            {label} 가격 추이
          </CardTitle>

          {/* Period tabs */}
          <div className="flex rounded-lg border bg-muted p-0.5" role="tablist" aria-label="기간 선택">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={period === tab.key}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  period === tab.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => setPeriod(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {loading && (
          <div className="relative h-[250px] w-full space-y-3 p-4">
            {/* Skeleton chart area */}
            <div className="flex items-end gap-1 h-[180px]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-muted animate-pulse"
                  style={{ height: `${30 + Math.random() * 60}%` }}
                />
              ))}
            </div>
            {/* Skeleton x-axis */}
            <div className="flex justify-between">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 w-10 rounded bg-muted animate-pulse" />
              ))}
            </div>
            {/* Loading overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <svg className="h-6 w-6 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-muted-foreground">시세 데이터를 불러오는 중...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-[250px] text-destructive text-sm">
            {error}
          </div>
        )}

        {!loading && !error && trendData && trendData.data.length > 0 && (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData.data}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `₩${v.toLocaleString()}`}
                  width={80}
                />
                <Tooltip
                  formatter={(value) => [`₩${Number(value).toLocaleString('ko-KR')}`, '가격']}
                  labelFormatter={(label) => `날짜: ${label}`}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={meta.color}
                  strokeWidth={2}
                  dot={trendData.data.length <= 15}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && !error && trendData && trendData.data.length === 0 && (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            해당 기간의 데이터가 없습니다.
          </div>
        )}

        {trendData?.stale && (
          <p className="text-[10px] text-warning mt-1 text-right">
            ⚠ 캐시 데이터입니다
          </p>
        )}
      </CardContent>
    </Card>
  );
}
