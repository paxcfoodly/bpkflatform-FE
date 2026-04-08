import Link from 'next/link';
import { Button } from '@/components/ui';

export function AboutCTA() {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-20"
      aria-label="문의하기 CTA"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center text-white">
        <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
          비피케이와 함께하세요
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm opacity-90 md:text-lg">
          포장장비에 관한 어떤 문의든 환영합니다. 전문 상담원이 빠르게 답변드립니다.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            variant="cta"
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/inquiry/estimate">견적문의</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white/20"
            asChild
          >
            <Link href="/inquiry/contact">1:1 문의</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
