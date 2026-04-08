import type { Metadata } from 'next';
import { MyPageGuard } from '@/components/my/MyPageGuard';
import { MyPageSidebar } from '@/components/my/MyPageSidebar';

export const metadata: Metadata = {
  title: '마이페이지 | BPK Hub',
};

/**
 * 마이페이지 레이아웃.
 * MyPageGuard: 인증 검사 (비로그인 시 리다이렉트)
 * MyPageSidebar: 데스크톱 사이드바 + 모바일 탭 네비게이션
 * 기존 GNB/Footer 는 상위 레이아웃에서 유지.
 */
export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MyPageGuard>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <MyPageSidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </MyPageGuard>
  );
}
