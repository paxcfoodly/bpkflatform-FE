'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Where to redirect when not authenticated (default: /auth/login) */
  redirectTo?: string;
}

/**
 * Wrapper that redirects unauthenticated users.
 * Shows nothing while the auth store is hydrating to avoid flash.
 */
export function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, hydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(redirectTo);
    }
  }, [hydrated, user, router, redirectTo]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
