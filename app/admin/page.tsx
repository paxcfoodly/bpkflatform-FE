'use client';

import { useDashboard } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Users, MessageSquare, Package, FileText, Eye, RefreshCw } from 'lucide-react';
// recharts 차트 제거 — StatCard로 대체 (바 차트가 StatCard와 중복, 스케일 불일치 문제)

import type { DashboardSummary, RecentInquiryItem } from '@/lib/api/admin';

// ── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-2 h-3 w-32" />
      </CardContent>
    </Card>
  );
}

// ── Chart helpers ────────────────────────────────────────────────────────────

// buildChartData 제거 — 바 차트를 StatCard 5개로 대체

// ── Status badge ─────────────────────────────────────────────────────────────

function statusLabel(status: string) {
  switch (status) {
    case 'pending':
      return '대기';
    case 'in_progress':
      return '진행 중';
    case 'completed':
      return '완료';
    case 'cancelled':
      return '취소';
    default:
      return status;
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// ── Recent inquiries table ───────────────────────────────────────────────────

function RecentInquiriesTable({ items }: { items: RecentInquiryItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        최근 문의가 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">회사명</th>
            <th className="pb-3 pr-4 font-medium">문의 유형</th>
            <th className="pb-3 pr-4 font-medium">상태</th>
            <th className="pb-3 font-medium">접수일</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b last:border-0">
              <td className="py-3 pr-4">{item.company_name ?? '-'}</td>
              <td className="py-3 pr-4">{item.inquiry_type}</td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(
                    item.status,
                  )}`}
                >
                  {statusLabel(item.status)}
                </span>
              </td>
              <td className="py-3 text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString('ko-KR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  // ── Error state ──
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-destructive">
          대시보드 데이터를 불러올 수 없습니다.
        </p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : '알 수 없는 오류'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          새로고침
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {isLoading || !data ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="전체 회원"
              value={data.users_count}
              icon={<Users className="h-5 w-5" />}
              description="등록된 총 회원 수"
            />
            <StatCard
              title="문의 건수"
              value={data.inquiries_count}
              icon={<MessageSquare className="h-5 w-5" />}
              description="접수된 총 문의 수"
            />
            <StatCard
              title="등록 제품"
              value={data.products_count}
              icon={<Package className="h-5 w-5" />}
              description="등록된 총 제품 수"
            />
            <StatCard
              title="게시글 수"
              value={data.posts_count}
              icon={<FileText className="h-5 w-5" />}
              description="등록된 총 게시글 수"
            />
            <StatCard
              title="오늘 조회수"
              value={data.today_views}
              icon={<Eye className="h-5 w-5" />}
              description="오늘 총 페이지 조회"
            />
          </>
        )}
      </div>

      {/* ── Recent Inquiries ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            최근 문의
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <TableSkeleton />
          ) : (
            <RecentInquiriesTable items={data.recent_inquiries} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
