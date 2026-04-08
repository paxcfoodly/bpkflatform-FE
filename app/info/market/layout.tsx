import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '원자재 시세 - BPK Hub',
  description:
    '식품 원자재 8종(쌀, 우유, 달걀, 돼지고기, 닭고기, 밀가루, 설탕, 식용유)의 실시간 시세와 가격 추이를 확인하세요. KAMIS 농산물유통정보 기반.',
  openGraph: {
    title: '원자재 시세 - BPK Hub',
    description: '식품 원자재 8종의 실시간 시세와 가격 추이를 확인하세요.',
  },
};

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
