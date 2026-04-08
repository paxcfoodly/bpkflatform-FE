/**
 * BPK Hub — 알림 목록 페이지 (P32)
 * /my/notifications — 읽음 처리 + 전체 읽음
 * useSearchParams → Suspense 래핑 필수
 */
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Bell,
  Megaphone,
  TrendingUp,
  MessageCircle,
  HelpCircle,
  CheckCheck,
} from 'lucide-react';
import {
  Card,
  CardContent,
  ControlledPagination,
  LoadingSpinner,
  Button,
} from '@/components/ui';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-my';
import { useToast } from '@/components/ui/Toast';
import type { NotificationListItem } from '@/lib/api/my';
import { cn } from '@/lib/utils';

// ── Icon mapping by notification type ───────────────────────────────────────

const NOTIFICATION_ICON: Record<string, typeof Bell> = {
  ANNOUNCEMENT: Megaphone,
  PRICE: TrendingUp,
  COMMENT: MessageCircle,
  INQUIRY: HelpCircle,
};

function NotificationCard({
  notification,
  onRead,
}: {
  notification: NotificationListItem;
  onRead: (n: NotificationListItem) => void;
}) {
  const Icon = NOTIFICATION_ICON[notification.type] ?? Bell;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        !notification.is_read && 'border-primary/30 bg-primary/5',
      )}
      onClick={() => onRead(notification)}
    >
      <CardContent className="flex items-start gap-4 p-4">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            notification.is_read
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium',
                !notification.is_read && 'font-semibold',
              )}
            >
              {notification.title}
            </span>
            {!notification.is_read && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            {new Date(notification.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const page = Number(searchParams.get('page') ?? '1');

  const { data, isLoading, error } = useNotifications({ page, limit: 10 });
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set('page', String(p));
    else params.delete('page');
    router.push(`/my/notifications?${params.toString()}`);
  };

  const handleRead = (notification: NotificationListItem) => {
    // 읽음 처리 후 link_url이 있으면 이동
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.link_url) {
      router.push(notification.link_url);
    }
  };

  const handleMarkAll = () => {
    markAllMutation.mutate(undefined, {
      onSuccess: () => toast('모든 알림을 읽음 처리했습니다.', 'success'),
      onError: () => toast('전체 읽음 처리에 실패했습니다.', 'error'),
    });
  };

  if (error) {
    return (
      <div className="py-20 text-center text-destructive">
        알림 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">알림</h1>
        {data?.data && data.data.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" />
            전체 읽음
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="mb-4 h-12 w-12 opacity-30" />
          <p>알림이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={handleRead}
              />
            ))}
          </div>

          <ControlledPagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

/**
 * 알림 목록 페이지 — useSearchParams → Suspense 래핑 필수.
 */
export default function NotificationsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NotificationsInner />
    </Suspense>
  );
}
