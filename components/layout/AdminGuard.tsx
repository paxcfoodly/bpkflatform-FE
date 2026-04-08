'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

/**
 * 관리자 인가 가드.
 * - hydrated=false 동안 로딩 스피너 표시 (SSR에서 role을 알 수 없으므로)
 * - 비로그인 또는 비관리자 → 홈으로 리다이렉트 + toast
 * - 인가된 관리자 → children 렌더링
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const isAdmin = user !== null && ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      toast('로그인이 필요합니다.', 'error');
      router.replace('/');
      return;
    }

    if (!ADMIN_ROLES.includes(user.role)) {
      toast('관리자 권한이 필요합니다.', 'error');
      router.replace('/');
    }
  }, [hydrated, user, router, toast]);

  // 하이드레이션 전 — 로딩 스피너
  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  // 비인가 상태 — 리다이렉트 대기 중 빈 화면
  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
