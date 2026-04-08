/**
 * BPK Hub — Community Home (/community)
 * 4종 게시판 카드 링크(자유/질문/정보/구인) + 최근 게시글 미리보기.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '커뮤니티 - BPK Hub',
  description:
    '식품제조업 종사자들의 커뮤니티. 자유게시판, 질문게시판, 정보공유, 구인구직 게시판에서 소통하세요.',
  openGraph: {
    title: '커뮤니티 - BPK Hub',
    description: '식품제조업 종사자들의 커뮤니티. 자유게시판, 질문, 정보공유, 구인구직.',
  },
};
import {
  MessageSquare,
  HelpCircle,
  BookOpen,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';

const BOARDS = [
  {
    type: 'free',
    label: '자유게시판',
    description: '식품제조업 관련 자유로운 이야기를 나눠보세요.',
    icon: MessageSquare,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    iconBg: 'bg-blue-100',
  },
  {
    type: 'question',
    label: '질문게시판',
    description: '업무 관련 궁금한 점을 질문하고 답변을 받아보세요.',
    icon: HelpCircle,
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    iconBg: 'bg-amber-100',
  },
  {
    type: 'info',
    label: '정보공유',
    description: '유용한 업계 정보, 규제 변경 사항 등을 공유하세요.',
    icon: BookOpen,
    color: 'bg-green-50 text-green-600 border-green-200',
    iconBg: 'bg-green-100',
  },
  {
    type: 'job',
    label: '구인구직',
    description: '인력 채용 및 구직 정보를 등록하세요.',
    icon: Briefcase,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    iconBg: 'bg-purple-100',
  },
] as const;

export default function CommunityPage() {
  return (
    <>
      {/* Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: '홈', href: '/' },
          { label: '커뮤니티', href: '/community' },
        ]}
        className="mb-6"
      />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">커뮤니티</h1>
        <p className="mt-2 text-muted-foreground">
          식품제조업 종사자들과 함께 정보를 교환하고 소통하세요.
        </p>
      </div>

      {/* Board Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {BOARDS.map((board) => {
          const Icon = board.icon;
          return (
            <Link
              key={board.type}
              href={`/community/${board.type}`}
              className="group flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className={`shrink-0 rounded-lg p-3 ${board.iconBg} transition-transform group-hover:scale-105`}
              >
                <Icon className={`h-6 w-6 ${board.color.split(' ')[1]}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                    {board.label}
                  </h2>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {board.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
