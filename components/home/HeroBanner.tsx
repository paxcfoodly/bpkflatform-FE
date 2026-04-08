'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const SLIDES = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/bpk-hero-1/1920/600',
    title: '포장장비 거래의 새로운 기준',
    subtitle: '최적의 포장장비를 찾아보세요',
    cta1: { label: '장비 보기', href: '/products' },
    cta2: { label: '견적 요청', href: '/inquiry/estimate' },
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/bpk-hero-2/1920/600',
    title: '정부공고·지원사업',
    subtitle: '전국 공공·민간 공고 정보를 한눈에 확인하세요',
    cta1: { label: '공고 보기', href: '/info/announcements' },
    cta2: { label: '시장 동향', href: '/info/market' },
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/bpk-hero-3/1920/600',
    title: '시세 정보 & 트렌드',
    subtitle: '포장장비 시장 동향을 실시간으로 파악하세요',
    cta1: { label: '시세 확인', href: '/info/market' },
    cta2: { label: '커뮤니티', href: '/community' },
  },
];

export function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative w-full" aria-label="메인 배너">
      {/* Viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="relative flex-none min-w-0 w-full h-[320px] lg:h-[480px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold md:text-4xl lg:text-5xl">
                  {slide.title}
                </h2>
                <p className="mt-2 text-sm md:text-lg lg:text-xl opacity-90">
                  {slide.subtitle}
                </p>
                <div className="mt-6 flex gap-3">
                  <Link href={slide.cta1.href}>
                    <Button variant="cta" size="lg">
                      {slide.cta1.label}
                    </Button>
                  </Link>
                  <Link href={slide.cta2.href}>
                    <Button variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white/20">
                      {slide.cta2.label}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition"
        aria-label="이전 슬라이드"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/50 transition"
        aria-label="다음 슬라이드"
      >
        <ChevronRight className="h-5 w-5 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => scrollTo(i)}
            className={cn(
              'h-2.5 rounded-full transition-all',
              selectedIndex === i
                ? 'w-8 bg-white'
                : 'w-2.5 bg-white/50 hover:bg-white/75',
            )}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
