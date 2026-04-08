/**
 * 범용 JSON-LD 구조화 데이터 렌더링 서버 컴포넌트.
 *
 * `<script type="application/ld+json">` 태그로 JSON-LD 객체를 직렬화하여 삽입한다.
 * 서버 컴포넌트이므로 'use client' 불필요.
 */

type JsonLdData = Record<string, unknown>;

interface JsonLdProps {
  /** JSON-LD 구조화 데이터 객체 (단일 또는 배열) */
  data: JsonLdData | JsonLdData[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
