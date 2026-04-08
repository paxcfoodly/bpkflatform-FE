const HISTORY_DATA = [
  {
    year: '2024',
    title: 'BPK 플랫폼 베타 출시',
    description: 'AI 매칭 시스템과 마켓플레이스를 결합한 베타 서비스를 오픈했습니다.',
  },
  {
    year: '2023',
    title: '시리즈 A 투자 유치',
    description: '포장장비 산업 디지털 전환 비전으로 시리즈 A 투자를 유치했습니다.',
  },
  {
    year: '2022',
    title: '비피케이 주식회사 설립',
    description: '식품제조업 포장장비 전문 플랫폼 사업을 위해 법인을 설립했습니다.',
  },
  {
    year: '2021',
    title: 'PoC 및 시장 검증',
    description: '식품제조업 현장 60곳 인터뷰를 통해 장비 유통 페인포인트를 검증했습니다.',
  },
  {
    year: '2020',
    title: '창업팀 결성',
    description: '포장장비 업계 경력 15년 이상의 전문가들이 모여 창업팀을 구성했습니다.',
  },
  {
    year: '2019',
    title: '식품포장장비 리서치 시작',
    description: '식품제조업 포장장비 시장의 디지털화 가능성을 연구하기 시작했습니다.',
  },
] as const;

export function Timeline() {
  return (
    <section className="py-12 lg:py-16" aria-label="연혁">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">
          연혁
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 h-full w-0.5 bg-primary/20 md:left-1/2 md:-translate-x-px" />

          <div className="space-y-10">
            {HISTORY_DATA.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={item.year + item.title}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Circle marker */}
                  <div className="absolute left-4 top-1 z-10 flex h-3 w-3 -translate-x-1/2 items-center justify-center md:left-1/2">
                    <span className="h-3 w-3 rounded-full bg-primary ring-4 ring-white" />
                  </div>

                  {/* Spacer for mobile left offset */}
                  <div className="w-8 shrink-0 md:hidden" />

                  {/* Content card */}
                  <div
                    className={`flex-1 rounded-lg border bg-card p-4 shadow-sm md:w-5/12 md:flex-none ${
                      isEven ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                    }`}
                  >
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {item.year}
                    </span>
                    <h3 className="mt-2 text-base font-bold md:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
