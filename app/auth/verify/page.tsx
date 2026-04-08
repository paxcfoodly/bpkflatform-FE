'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import * as authApi from '@/lib/api/auth';

type VerifyState = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('인증 토큰이 없습니다. 이메일의 인증 링크를 다시 확인해주세요.');
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setState('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setState('error');
        setMessage(err.message || '이메일 인증에 실패했습니다.');
      });
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      {state === 'loading' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="mt-4 text-xl font-bold">이메일 인증 중...</h1>
          <p className="mt-2 text-sm text-muted-foreground">잠시만 기다려주세요.</p>
        </>
      )}

      {state === 'success' && (
        <>
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h1 className="mt-4 text-xl font-bold">이메일 인증 완료!</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <Link href="/auth/login" className="mt-6">
            <Button size="lg">로그인하러 가기</Button>
          </Link>
        </>
      )}

      {state === 'error' && (
        <>
          <XCircle className="h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">인증 실패</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <Link href="/auth/login" className="mt-6">
            <Button variant="outline" size="lg">
              로그인 페이지로 이동
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
