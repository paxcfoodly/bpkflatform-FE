import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import { LayoutSelector } from '@/components/layout';
import { JsonLd } from '@/components/seo';

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bpkhub.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'BPK Hub — 식품제조업 커뮤니티 & 포장장비 플랫폼',
  description:
    '식품제조업 종사자를 위한 커뮤니티, 포장장비 마켓플레이스, 원자재 시세, AI 매칭 서비스',
  openGraph: {
    locale: 'ko_KR',
    type: 'website',
    siteName: 'BPK Hub',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-[family-name:var(--font-pretendard)] antialiased">
        <Providers>
          <LayoutSelector>{children}</LayoutSelector>
        </Providers>
        {/* Structured data — application/ld+json (Organization) */}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'BPK Hub',
            url: SITE_URL,
            logo: `${SITE_URL}/logo.png`,
            description:
              '식품제조업 종사자를 위한 커뮤니티, 포장장비 마켓플레이스, 원자재 시세, AI 매칭 서비스',
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              availableLanguage: 'Korean',
            },
            sameAs: [],
          }}
        />
        {/* GA4 Analytics — only rendered when NEXT_PUBLIC_GA_ID is set */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
