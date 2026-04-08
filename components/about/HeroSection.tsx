export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      aria-label="회사소개 히어로"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center text-white">
        <p className="text-sm font-medium uppercase tracking-widest opacity-80 md:text-base">
          About BPK
        </p>
        <h1 className="mt-3 text-3xl font-extrabold md:text-4xl lg:text-5xl">
          비피케이 주식회사
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base opacity-90 md:text-lg lg:text-xl">
          식품제조업 포장장비의 모든 것 — 신뢰와 기술로 고객의 생산성을 높입니다.
        </p>
      </div>
    </section>
  );
}
