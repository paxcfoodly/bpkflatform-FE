'use client';

import * as React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GalleryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
}

function ImageGallery({ images, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);

  const goTo = React.useCallback(
    (index: number) => {
      if (!images.length) return;
      setActiveIndex((index + images.length) % images.length);
    },
    [images.length],
  );

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!fullscreen) return;
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
      if (e.key === 'ArrowRight') goTo(activeIndex + 1);
    },
    [fullscreen, activeIndex, goTo],
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll in fullscreen
  React.useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  if (!images.length) return null;

  const activeImage = images[activeIndex];

  return (
    <>
      <div className={cn('space-y-3', className)} data-testid="image-gallery">
        {/* Main image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {/* Fullscreen button */}
          <button
            onClick={() => setFullscreen(true)}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            aria-label="전체화면으로 보기"
          >
            <Expand className="h-4 w-4" />
          </button>
          {/* Navigation arrows on main image */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                aria-label="이전 이미지"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                aria-label="다음 이미지"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="이미지 썸네일">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`이미지 ${i + 1}: ${img.alt}`}
                className={cn(
                  'relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                  i === activeIndex
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-transparent opacity-60 hover:opacity-100',
                )}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="이미지 전체화면"
        >
          {/* Close button */}
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="닫기"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image counter */}
          <span className="absolute left-4 top-4 text-sm text-white/70">
            {activeIndex + 1} / {images.length}
          </span>

          {/* Fullscreen image */}
          <div
            className="relative h-[80vh] w-[90vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="이전 이미지"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="다음 이미지"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Fullscreen thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  aria-label={`이미지 ${i + 1}`}
                  className={cn(
                    'relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                    i === activeIndex
                      ? 'border-white ring-2 ring-white/40'
                      : 'border-transparent opacity-50 hover:opacity-100',
                  )}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export { ImageGallery };
