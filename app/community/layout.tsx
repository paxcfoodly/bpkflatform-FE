/**
 * BPK Hub — Community Layout
 * 커뮤니티 공통 레이아웃 (Breadcrumb, max-width 래퍼).
 */
import type { ReactNode } from 'react';

export const metadata = {
  title: '커뮤니티 - BPK Hub',
  description:
    '식품제조업 종사자들의 커뮤니티. 자유게시판, 질문게시판, 정보공유, 구인구직 게시판을 이용하세요.',
  openGraph: {
    title: '커뮤니티 - BPK Hub',
    description: '식품제조업 종사자들의 커뮤니티. 자유게시판, 질문, 정보공유, 구인구직.',
  },
};

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
