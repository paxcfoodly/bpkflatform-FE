'use client';

import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductCard } from '@/components/ui';
import { useProducts } from '@/hooks/use-products';

export function ProductSlider() {
  const router = useRouter();
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });

  const { data, isLoading } = useProducts({ limit: 6 });
  const products = data?.data ?? [];

  return (
    <section className="py-12" aria-label="추천 장비">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold md:text-2xl">추천 장비</h2>
          <a
            href="/products"
            className="text-sm text-primary hover:underline"
          >
            전체보기 →
          </a>
        </div>

        {isLoading ? (
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-none w-[280px] sm:w-[260px] md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] h-[280px] bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            등록된 장비가 없습니다.
          </p>
        ) : (
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-none min-w-0 w-[280px] sm:w-[260px] md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
                >
                  <ProductCard
                    image={product.thumbnail_url || '/images/placeholder-product.jpg'}
                    title={product.name}
                    description={product.subtitle || product.category_name || ''}
                    price={product.price_label || (product.price ? `₩ ${Number(product.price).toLocaleString()}` : '견적문의')}
                    onClick={() => router.push(`/products/${product.slug}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
