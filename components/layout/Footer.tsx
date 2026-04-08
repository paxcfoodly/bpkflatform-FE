import Link from 'next/link';

const FOOTER_LINKS = {
  서비스: [
    { label: '장비마켓', href: '/products' },
    { label: '원자재시세', href: '/info/market' },
    { label: '견적문의', href: '/inquiry/estimate' },
  ],
  커뮤니티: [
    { label: '자유게시판', href: '/community' },
    { label: '공고/지원사업', href: '/info/announcements' },
    { label: '뉴스/트렌드', href: '/news' },
  ],
  고객지원: [
    { label: '문의하기', href: '/inquiry/contact' },
    { label: '회사소개', href: '/about' },
  ],
} as const;

const LEGAL_LINKS = [
  { label: '이용약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '이메일무단수집거부', href: '/email-policy' },
] as const;

export function Footer() {
  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Link Grid */}
        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold text-primary"
            >
              <span className="text-2xl">BPK</span>
              <span className="text-sm font-medium text-muted-foreground">
                Hub
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              식품제조업 종사자를 위한
              <br />
              커뮤니티 & 포장장비 플랫폼
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground">
                {category}
              </h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          {/* Company Details */}
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">
              (주)비피케이 | 대표: 홍길동 | 사업자등록번호: 000-00-00000
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              서울특별시 강남구 테헤란로 00길 00, 0층
            </p>
          </div>

          {/* Legal Links */}
          <nav className="flex flex-wrap justify-center gap-4" aria-label="법적 고지">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.label === '개인정보처리방침'
                    ? 'text-xs font-semibold text-foreground transition-colors hover:text-primary'
                    : 'text-xs text-muted-foreground transition-colors hover:text-foreground'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="border-t py-4">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} BPK Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
