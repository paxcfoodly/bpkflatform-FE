import { MapPin, Phone, Mail } from 'lucide-react';

const COMPANY_INFO = {
  address: '서울특별시 강남구 테헤란로 123, BPK빌딩 5층',
  phone: '02-1234-5678',
  email: 'contact@bpk.co.kr',
  lat: 37.5013,
  lng: 127.0396,
} as const;

export function LocationMap() {
  const mapUrl = `https://map.kakao.com/link/map/비피케이,${COMPANY_INFO.lat},${COMPANY_INFO.lng}`;

  return (
    <section className="py-12 lg:py-16" aria-label="오시는 길">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          오시는 길
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Map iframe — 2 cols */}
          <div className="overflow-hidden rounded-xl border shadow-sm md:col-span-2">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={mapUrl}
                title="비피케이 본사 위치 — 카카오맵"
                allowFullScreen
              />
            </div>
          </div>

          {/* Contact info */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">주소</p>
                <p className="text-sm text-muted-foreground">
                  {COMPANY_INFO.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">전화</p>
                <p className="text-sm text-muted-foreground">
                  {COMPANY_INFO.phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">이메일</p>
                <p className="text-sm text-muted-foreground">
                  {COMPANY_INFO.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
