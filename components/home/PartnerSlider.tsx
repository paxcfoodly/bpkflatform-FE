'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const PARTNERS = [
  { id: 1, name: 'CAT', logo: 'https://picsum.photos/seed/partner-1/200/80' },
  { id: 2, name: '두산', logo: 'https://picsum.photos/seed/partner-2/200/80' },
  { id: 3, name: '볼보', logo: 'https://picsum.photos/seed/partner-3/200/80' },
  { id: 4, name: '코마츠', logo: 'https://picsum.photos/seed/partner-4/200/80' },
  { id: 5, name: '히타치', logo: 'https://picsum.photos/seed/partner-5/200/80' },
  { id: 6, name: '현대', logo: 'https://picsum.photos/seed/partner-6/200/80' },
  { id: 7, name: '리벨', logo: 'https://picsum.photos/seed/partner-7/200/80' },
  { id: 8, name: '쿠보타', logo: 'https://picsum.photos/seed/partner-8/200/80' },
];

export function PartnerSlider() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })],
  );

  return (
    <section className="py-12 border-t" aria-label="파트너사">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-lg font-semibold text-muted-foreground mb-8">
          신뢰할 수 있는 파트너사
        </h2>
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-8">
            {PARTNERS.map((partner) => (
              <div
                key={partner.id}
                className="flex-none min-w-0 w-[150px] md:w-[180px] flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 w-auto object-contain opacity-60 transition-opacity hover:opacity-100 grayscale hover:grayscale-0"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
