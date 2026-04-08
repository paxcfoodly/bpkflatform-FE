import Link from 'next/link';
import { FileText, Megaphone, TrendingUp, Wrench } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';

const SERVICES = [
  {
    icon: Wrench,
    title: '장비 목록',
    description: '다양한 포장장비를 한눈에 확인하세요',
    href: '/products',
  },
  {
    icon: FileText,
    title: '견적요청',
    description: '간편하게 견적을 요청하고 비교하세요',
    href: '/inquiry/estimate',
  },
  {
    icon: Megaphone,
    title: '정부공고',
    description: '전국 공공·민간 공고정보를 확인하세요',
    href: '/info/announcements',
  },
  {
    icon: TrendingUp,
    title: '시세정보',
    description: '포장장비 시장 동향과 시세를 파악하세요',
    href: '/info/market',
  },
] as const;

export function ServiceCards() {
  return (
    <section className="py-12" aria-label="주요 서비스">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold md:text-2xl mb-6">주요 서비스</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {SERVICES.map((svc) => (
            <Link key={svc.title} href={svc.href} className="block">
              <Card className="group cursor-pointer transition-all hover:-translate-y-1 h-full">
                <CardHeader className="items-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <svc.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-base md:text-lg">{svc.title}</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {svc.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
