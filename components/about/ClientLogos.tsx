const CLIENTS = [
  { id: 1, name: 'CJ제일제당', logo: 'https://picsum.photos/seed/client-1/200/80' },
  { id: 2, name: '오뚜기', logo: 'https://picsum.photos/seed/client-2/200/80' },
  { id: 3, name: '농심', logo: 'https://picsum.photos/seed/client-3/200/80' },
  { id: 4, name: '풀무원', logo: 'https://picsum.photos/seed/client-4/200/80' },
  { id: 5, name: '동원F&B', logo: 'https://picsum.photos/seed/client-5/200/80' },
  { id: 6, name: '대상', logo: 'https://picsum.photos/seed/client-6/200/80' },
  { id: 7, name: '삼양식품', logo: 'https://picsum.photos/seed/client-7/200/80' },
  { id: 8, name: '오리온', logo: 'https://picsum.photos/seed/client-8/200/80' },
  { id: 9, name: '롯데웰푸드', logo: 'https://picsum.photos/seed/client-9/200/80' },
  { id: 10, name: '매일유업', logo: 'https://picsum.photos/seed/client-10/200/80' },
  { id: 11, name: '하림', logo: 'https://picsum.photos/seed/client-11/200/80' },
  { id: 12, name: '사조대림', logo: 'https://picsum.photos/seed/client-12/200/80' },
];

export function ClientLogos() {
  return (
    <section className="py-12 lg:py-16" aria-label="주요 고객사">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          주요 고객사
        </h2>

        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
          {CLIENTS.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-center rounded-lg border bg-card p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={client.logo}
                alt={client.name}
                className="h-10 w-auto object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
