import type { Metadata } from 'next';

import {
  HeroSection,
  VisionMission,
  Timeline,
  ClientLogos,
  VideoSection,
  LocationMap,
  AboutCTA,
} from '@/components/about';

export const metadata: Metadata = {
  title: '회사소개 — BPK Hub',
  description:
    '비피케이 주식회사 소개. 비전, 미션, 사업영역, 연혁, 주요 고객사, 오시는 길 등 BPK에 대한 모든 정보를 확인하세요.',
  openGraph: {
    title: '회사소개 — BPK Hub',
    description:
      '비피케이 주식회사 소개 — 비전·미션, 연혁, 고객사, 오시는 길.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main>
      {/* Hero — 풀와이드 */}
      <HeroSection />

      {/* 비전·미션·사업영역 */}
      <VisionMission />

      {/* 연혁 타임라인 */}
      <Timeline />

      {/* 주요 고객사 로고 */}
      <ClientLogos />

      {/* 회사 소개 영상 */}
      <VideoSection />

      {/* 오시는 길 (카카오맵) */}
      <LocationMap />

      {/* CTA — 풀와이드 */}
      <AboutCTA />
    </main>
  );
}
