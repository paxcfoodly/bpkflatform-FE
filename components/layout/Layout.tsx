import { GNB } from './GNB';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * 공통 레이아웃 — GNB + 메인 콘텐츠 + Footer
 * 반응형 브레이크포인트: 320 / 768 / 1024 / 1280
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <GNB />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
