'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (추후 에러 리포팅 서비스 연동 가능)
    console.error('[BPK Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      {/* 에러 아이콘 */}
      <div className="mb-6 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1 className="mb-2 text-3xl font-bold text-foreground">
        문제가 발생했습니다
      </h1>
      <p className="mb-4 max-w-md text-muted-foreground">
        요청을 처리하는 중 오류가 발생했습니다.
        <br />
        잠시 후 다시 시도해 주세요.
      </p>

      {/* 개발 모드에서만 에러 메시지 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <pre className="mb-6 max-w-lg overflow-auto rounded-md bg-muted p-4 text-left text-xs text-muted-foreground">
          {error.message}
          {error.digest && `\nDigest: ${error.digest}`}
        </pre>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
