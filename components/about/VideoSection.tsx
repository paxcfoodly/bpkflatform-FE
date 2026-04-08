export function VideoSection() {
  return (
    <section className="py-12 lg:py-16" aria-label="회사 소개 영상">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          회사 소개 영상
        </h2>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border shadow-sm">
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="BPK 회사 소개 영상"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
