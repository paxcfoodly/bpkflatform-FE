import type { Metadata } from 'next';

import { HeroBanner } from '@/components/home';
import { ServiceCards } from '@/components/home';
import { ProductSlider } from '@/components/home';
import { MarketTicker } from '@/components/home';
import { AnnouncementPreview } from '@/components/home';
import { CommunityPreview } from '@/components/home';
import { StatCounter } from '@/components/home';
import { CTABanner } from '@/components/home';
import { NewsPreview } from '@/components/home';
import { PartnerSlider } from '@/components/home';
import { JsonLd } from '@/components/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bpkhub.com';

export const metadata: Metadata = {
  title: 'BPK Hub — 식품제조업 포장장비 플랫폼',
  description:
    '식품제조업 종사자를 위한 원스톱 포장장비 플랫폼. 커뮤니티, 포장장비 마켓플레이스, 원자재 시세 정보, AI 기반 장비 매칭 서비스를 제공합니다.',
  openGraph: {
    title: 'BPK Hub — 식품제조업 포장장비 플랫폼',
    description:
      '식품제조업 종사자를 위한 원스톱 포장장비 플랫폼. 커뮤니티, 마켓플레이스, 원자재 시세, AI 매칭 서비스.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <main>
      {/* Structured data — application/ld+json (WebSite + SearchAction) */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'BPK Hub',
          url: SITE_URL,
          description:
            '식품제조업 종사자를 위한 원스톱 포장장비 플랫폼. 커뮤니티, 마켓플레이스, 원자재 시세, AI 매칭 서비스.',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      {/* Hero — 풀와이드 */}
      <HeroBanner />

      {/* 서비스 카드 */}
      <section className="py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4">
          <ServiceCards />
        </div>
      </section>

      {/* 공고 + 뉴스 — 좌우 2컬럼 */}
      <section className="py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <AnnouncementPreview />
            <NewsPreview />
          </div>
        </div>
      </section>

      {/* 시세 티커 */}
      <section className="py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4">
          <MarketTicker />
        </div>
      </section>

      {/* 커뮤니티 미리보기 */}
      <section className="py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4">
          <CommunityPreview />
        </div>
      </section>

      {/* 제품 슬라이더 */}
      <section className="py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4">
          <ProductSlider />
        </div>
      </section>

      {/* 통계 카운터 */}
      <section className="py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4">
          <StatCounter />
        </div>
      </section>

      {/* CTA 배너 — 풀와이드 */}
      <CTABanner />

      {/* 파트너 슬라이더 */}
      <section className="py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4">
          <PartnerSlider />
        </div>
      </section>
    </main>
  );
}
