/**
 * BPK Hub — 문의 완료 페이지
 * 견적요청·1:1문의·A/S 신청 제출 후 리다이렉트되는 완료 안내 페이지.
 */
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui';

const TYPE_LABELS: Record<string, string> = {
  estimate: '견적 요청',
  contact: '1:1 문의',
  as: 'A/S 신청',
};

function InquiryCompleteInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') ?? 'contact';
  const label = TYPE_LABELS[type] ?? '문의';

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>

      <h1 className="mb-3 text-2xl font-bold text-foreground">
        {label}이 접수되었습니다
      </h1>

      <p className="mb-2 text-muted-foreground">
        입력하신 이메일로 접수 확인 메일이 발송됩니다.
      </p>
      <p className="mb-8 text-muted-foreground">
        영업일 기준 <span className="font-semibold text-foreground">1~2일 이내</span> 담당자가 회신드리겠습니다.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/products">
          <Button variant="outline" size="md">
            <ArrowLeft className="h-4 w-4" />
            제품 둘러보기
          </Button>
        </Link>
        <Link href="/">
          <Button variant="primary" size="md">
            <Home className="h-4 w-4" />
            홈으로
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function InquiryCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <InquiryCompleteInner />
    </Suspense>
  );
}
