'use client';

import { usePathname } from 'next/navigation';
import { Layout } from './Layout';

/**
 * pathname 기반 조건부 레이아웃 선택기.
 * /admin 경로에서는 GNB+Footer(Layout) 래핑을 건너뛰고,
 * 나머지 경로에서는 기존 Layout을 적용한다.
 */
export function LayoutSelector({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return <Layout>{children}</Layout>;
}
