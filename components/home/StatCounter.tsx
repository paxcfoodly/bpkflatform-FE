'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { label: '등록 장비', target: 12450, suffix: '대' },
  { label: '거래 완료', target: 3820, suffix: '건' },
  { label: '활성 회원', target: 28500, suffix: '명' },
  { label: '입찰 공고', target: 1560, suffix: '건' },
];

function useCountUp(target: number, isVisible: boolean, duration = 2000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, target, duration]);

  return value;
}

function StatItem({ label, target, suffix }: { label: string; target: number; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const value = useCountUp(target, isVisible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // 한 번만 트리거
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-bold text-primary md:text-4xl">
        {value.toLocaleString()}
        <span className="text-lg ml-1">{suffix}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground md:text-base">{label}</p>
    </div>
  );
}

export function StatCounter() {
  return (
    <section className="py-16 bg-muted/20" aria-label="핵심 지표">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <StatItem
              key={stat.label}
              label={stat.label}
              target={stat.target}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
