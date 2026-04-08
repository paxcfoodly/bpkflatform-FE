import { Button } from '@/components/ui';

export function CTABanner() {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-20"
      aria-label="CTA 배너"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
        <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
          지금 바로 시작하세요
        </h2>
        <p className="mt-3 text-sm md:text-lg opacity-90 max-w-2xl mx-auto">
          BPK 플랫폼에서 중장비 거래, 입찰, 시세 정보를 한 곳에서 관리하세요.
          회원가입 후 모든 서비스를 무료로 이용할 수 있습니다.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="cta" size="lg" className="bg-white text-primary hover:bg-white/90">
            무료 회원가입
          </Button>
          <Button variant="ghost" size="lg" className="border border-white text-white hover:bg-white/20 hover:text-white">
            서비스 둘러보기
          </Button>
        </div>
      </div>
    </section>
  );
}
