'use client';

import { useRouter } from 'next/navigation';
import { User, Bookmark, MessageSquare, FileText, Bell } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
} from '@/components/ui';
import { useMyProfile } from '@/hooks/use-my';
import { useMyPageSummary } from '@/hooks/use-my';

/**
 * 마이페이지 홈 (P27).
 * 프로필 요약 + 4 summary cards (스크랩·문의·게시글·알림).
 */
export default function MyHomePage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading, error: profileError } = useMyProfile();
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useMyPageSummary();

  const isLoading = profileLoading || summaryLoading;

  if (profileError || summaryError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-primary underline"
        >
          새로고침
        </button>
      </div>
    );
  }

  const summaryCards = [
    {
      label: '스크랩',
      count: summary?.scrap_count ?? 0,
      icon: Bookmark,
      href: '/my/scraps',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: '문의내역',
      count: summary?.inquiry_count ?? 0,
      icon: MessageSquare,
      href: '/my/inquiries',
      color: 'text-green-600 bg-green-50',
    },
    {
      label: '내 게시글',
      count: summary?.post_count ?? 0,
      icon: FileText,
      href: '/my/posts',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: '알림',
      count: summary?.unread_notification_count ?? 0,
      icon: Bell,
      href: '/my/notifications',
      color: 'text-orange-600 bg-orange-50',
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* ── Profile Section ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            내 프로필
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold">{profile?.name}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              {profile?.company_name && (
                <p className="text-sm text-muted-foreground">
                  {profile.company_name}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => router.push(card.href)}
            >
              <CardContent className="flex flex-col items-center gap-3 p-6">
                {isLoading ? (
                  <>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </>
                ) : (
                  <>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${card.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">{card.count}</p>
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
