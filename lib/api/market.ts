/**
 * BPK Hub — Market Price API Client
 * Typed fetch wrappers for /api/market/* endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PriceItem {
  commodity: string;
  label: string;
  unit: string;
  price: number | null;
  prev_price: number | null;
  week_price: number | null;
  month_price: number | null;
  year_price: number | null;
  change_amount: number | null;
  change_rate: number | null;
  direction: 'up' | 'down' | 'stable';
  comparison_basis: string | null;
  date: string;
  stale: boolean;
}

export interface PricesResponse {
  success: boolean;
  data: PriceItem[];
  count: number;
}

export interface TrendPoint {
  date: string;
  price: number;
}

export interface TrendData {
  commodity: string;
  label: string;
  unit: string;
  period: string;
  data: TrendPoint[];
  stale: boolean;
}

export interface TrendResponse {
  success: boolean;
  data: TrendData;
}

// ── API Error ────────────────────────────────────────────────────────────────

export class MarketApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'MarketApiError';
    this.status = status;
  }
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function marketFetch<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 1800 }, // 30분 ISR 캐시
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.detail ?? res.statusText;
    throw new MarketApiError(res.status, detail);
  }

  return res.json();
}

// ── API Functions ────────────────────────────────────────────────────────────

/** 8종 원자재 현재 시세 조회 */
export async function fetchMarketPrices(): Promise<PricesResponse> {
  return marketFetch<PricesResponse>('/api/market/prices');
}

/** 원자재별 가격 추이 조회 */
export async function fetchMarketTrends(
  item: string,
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
): Promise<TrendResponse> {
  return marketFetch<TrendResponse>(
    `/api/market/trends?item=${encodeURIComponent(item)}&period=${period}`,
  );
}

// ── Commodity metadata (icon/color mapping) ──────────────────────────────────

export const COMMODITY_META: Record<string, { emoji: string; color: string }> = {
  RICE:         { emoji: '🍚', color: '#10b981' },
  MILK:         { emoji: '🥛', color: '#3b82f6' },
  EGG:          { emoji: '🥚', color: '#f59e0b' },
  PORK:         { emoji: '🥩', color: '#ef4444' },
  CHICKEN:      { emoji: '🍗', color: '#8b5cf6' },
  WHEAT_FLOUR:  { emoji: '🌾', color: '#d97706' },
  SUGAR:        { emoji: '🍬', color: '#ec4899' },
  SOYBEAN_OIL:  { emoji: '🫒', color: '#14b8a6' },
};
