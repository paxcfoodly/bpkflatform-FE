/**
 * BPK Hub — Board List Page (/community/[boardType])
 * Suspense 래핑 + 게시판별 게시글 목록.
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/Skeleton';
import { BoardListContent } from './BoardListContent';

const VALID_BOARDS = ['free', 'question', 'info', 'job'] as const;
type ValidBoard = (typeof VALID_BOARDS)[number];

const BOARD_META: Record<ValidBoard, { title: string; description: string }> = {
  free: {
    title: '자유게시판 - BPK Hub 커뮤니티',
    description: '식품제조업 관련 자유로운 이야기를 나눠보세요.',
  },
  question: {
    title: '질문게시판 - BPK Hub 커뮤니티',
    description: '업무 관련 궁금한 점을 질문하고 답변을 받아보세요.',
  },
  info: {
    title: '정보공유 - BPK Hub 커뮤니티',
    description: '유용한 업계 정보, 규제 변경 사항 등을 공유하세요.',
  },
  job: {
    title: '구인구직 - BPK Hub 커뮤니티',
    description: '인력 채용 및 구직 정보를 등록하세요.',
  },
};

interface PageProps {
  params: Promise<{ boardType: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { boardType } = await params;
  const meta = BOARD_META[boardType as ValidBoard];
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    openGraph: { title: meta.title, description: meta.description },
  };
}

export async function generateStaticParams() {
  return VALID_BOARDS.map((boardType) => ({ boardType }));
}

export default async function BoardPage({ params }: PageProps) {
  const { boardType } = await params;

  if (!VALID_BOARDS.includes(boardType as ValidBoard)) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <BoardListContent boardType={boardType as ValidBoard} />
    </Suspense>
  );
}
