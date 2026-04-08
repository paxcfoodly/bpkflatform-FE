import { Target, Lightbulb, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';

const ITEMS = [
  {
    icon: Target,
    title: '비전',
    description:
      '식품제조업 포장장비 산업의 디지털 전환을 선도하여, 모든 제조 현장이 최적의 장비를 쉽고 빠르게 확보할 수 있는 세상을 만듭니다.',
  },
  {
    icon: Lightbulb,
    title: '미션',
    description:
      'AI 기반 매칭과 데이터 분석으로 장비 유통의 비효율을 해소하고, 투명한 가격 정보와 원스톱 서비스를 제공합니다.',
  },
  {
    icon: Briefcase,
    title: '사업영역',
    description:
      '포장장비 마켓플레이스, 견적 중개, 원자재 시세 정보, 커뮤니티, 입찰공고 연계 등 식품제조업을 위한 종합 플랫폼을 운영합니다.',
  },
] as const;

export function VisionMission() {
  return (
    <section className="py-12 lg:py-16" aria-label="비전·미션·사업영역">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          비전 · 미션 · 사업영역
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {ITEMS.map((item) => (
            <Card
              key={item.title}
              className="group transition-all hover:-translate-y-1"
            >
              <CardHeader className="items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-lg md:text-xl">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed md:text-base">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
