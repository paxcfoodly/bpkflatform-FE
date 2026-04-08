'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#ffffff',
          color: '#1e293b',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          {/* BPK 로고 텍스트 */}
          <div
            style={{
              marginBottom: '2rem',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0066ff',
            }}
          >
            BPK Hub
          </div>

          {/* 에러 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ marginBottom: '1.5rem' }}
          >
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>

          <h1
            style={{
              margin: '0 0 0.5rem',
              fontSize: '1.875rem',
              fontWeight: 700,
            }}
          >
            심각한 오류가 발생했습니다
          </h1>
          <p
            style={{
              margin: '0 0 2rem',
              maxWidth: '28rem',
              color: '#64748b',
              lineHeight: 1.6,
            }}
          >
            페이지를 불러오는 중 예기치 않은 오류가 발생했습니다.
            <br />
            문제가 지속되면 관리자에게 문의해 주세요.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#ffffff',
                backgroundColor: '#0066ff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1e293b',
                backgroundColor: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              홈으로
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
