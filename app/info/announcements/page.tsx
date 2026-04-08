/**
 * BPK Hub — Announcement List Page (/info/announcements)
 * Category tabs, D-Day badges, scrap button, search, pagination.
 */
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Skeleton';
import { AnnouncementListContent } from './AnnouncementListContent';

export const metadata = {
  title: '정부 공고 · 지원사업 - BPK Hub',
  description:
    '식품제조업 관련 정부 공고, 지원사업, 입찰 정보를 한눈에 확인하세요. 마감일별 D-Day 뱃지와 스크랩 기능을 제공합니다.',
  openGraph: {
    title: '정부 공고 · 지원사업 - BPK Hub',
    description: '식품제조업 관련 정부 공고, 지원사업, 입찰 정보를 한눈에 확인하세요.',
  },
};

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <AnnouncementListContent />
    </Suspense>
  );
}
