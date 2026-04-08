/**
 * BPK Hub — HACCP 인증 정보 페이지 (/info/haccp)
 * 인증 절차 가이드 + 인증기관 검색/필터 + FAQ
 */
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Skeleton';
import { HaccpContent } from './HaccpContent';

export const metadata = {
  title: 'HACCP 인증 정보 - BPK Hub',
  description:
    'HACCP 인증 절차 안내, 인증기관 검색, 자주 묻는 질문을 확인하세요. 식품제조업 HACCP 인증에 필요한 모든 정보를 제공합니다.',
  openGraph: {
    title: 'HACCP 인증 정보 - BPK Hub',
    description: 'HACCP 인증 절차 안내, 인증기관 검색, 자주 묻는 질문을 확인하세요.',
  },
};

export default function HaccpPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <HaccpContent />
    </Suspense>
  );
}
