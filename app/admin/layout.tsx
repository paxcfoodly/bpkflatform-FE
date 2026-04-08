import type { Metadata } from 'next';
import { AdminGuard, AdminLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'BPK Hub 관리자',
};

/**
 * 관리자 섹션 레이아웃.
 * AdminGuard: 인증/인가 검사 (비관리자 리다이렉트)
 * AdminLayout: 사이드바+헤더 관리자 UI
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
