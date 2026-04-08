/**
 * BPK Hub — News & Notice List Page (/news)
 * Type tabs (전체/뉴스/공지), search, pagination.
 */
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Skeleton';
import { NewsListContent } from './NewsListContent';

export const metadata = {
  title: '뉴스·공지 - BPK Hub',
  description:
    'BPK Hub 뉴스와 공지사항을 확인하세요. 최신 소식과 업데이트를 한눈에 볼 수 있습니다.',
  openGraph: {
    title: '뉴스·공지 - BPK Hub',
    description: '최신 소식과 업데이트를 한눈에 볼 수 있습니다.',
  },
};

export default function NewsPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <NewsListContent />
    </Suspense>
  );
}
