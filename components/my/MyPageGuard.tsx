'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';

/**
 * 마이페이지 인증 가드.
 * - hydrated=false 동안 로딩 스피너 표시
 * - 비로그인 → /auth/login으로 리다이렉트 + toast
 * - 로그인 상태 → children 렌더링 (role 검사 없음)
 */
export function MyPageGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      toast('로그인이 필요합니다.', 'error');
      router.replace('/auth/login');
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

  // 비로그인 — 리다이렉트 대기 중 빈 화면
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
