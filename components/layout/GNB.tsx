'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, User, ChevronDown, Settings, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';
import { useAuthStore } from '@/stores/authStore';

/** GNB 메뉴 항목 */
export const NAV_ITEMS = [
  { label: '장비마켓', href: '/products' },
  { label: 'AI매칭', href: '/ai/matching' },
  { label: '원자재시세', href: '/info/market' },
  { label: 'HACCP', href: '/info/haccp' },
  { label: '커뮤니티', href: '/community' },
  { label: '공고/지원사업', href: '/info/announcements' },
  { label: '뉴스/트렌드', href: '/news' },
  { label: '회사소개', href: '/about' },
] as const;

/** 데스크톱 우측 액션: 견적문의 + 사용자 드롭다운 */
function DesktopActions({
  user,
  hydrated,
  logoutAction,
  router,
}: {
  user: { name: string; role?: string } | null;
  hydrated: boolean;
  logoutAction: () => Promise<void>;
  router: ReturnType<typeof useRouter>;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="hidden lg:flex lg:items-center lg:gap-3">
      {/* 견적문의 — 항상 왼쪽 */}
      <Link
        href="/inquiry/estimate"
        className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        견적문의
      </Link>

      {hydrated && user ? (
        /* 로그인 상태: 닉네임 드롭다운 */
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <User className="h-4 w-4" />
            {user.name}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border bg-background shadow-lg z-50">
              <div className="py-1">
                <Link
                  href="/my"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  마이페이지
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    관리자 페이지
                  </Link>
                )}
                <hr className="my-1 border-border" />
                <button
                  type="button"
                  onClick={async () => {
                    setOpen(false);
                    await logoutAction();
                    router.push('/');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  data-testid="gnb-logout"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 비로그인 상태: 로그인/회원가입 */
        <>
          <Link
            href="/auth/login"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            로그인
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            회원가입
          </Link>
        </>
      )}
    </div>
  );
}

export function GNB() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, hydrated, logoutAction } = useAuthStore();

  // Sticky header shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm transition-shadow duration-200',
          scrolled && 'shadow-sm',
        )}
        role="banner"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-primary"
            aria-label="BPK Hub 홈으로 이동"
          >
            <span className="text-2xl">BPK</span>
            <span className="text-sm font-medium text-muted-foreground">
              Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1" role="navigation" aria-label="메인 메뉴">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[1.0625rem] h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <DesktopActions user={user} hydrated={hydrated} logoutAction={logoutAction} router={router} />

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
      />
    </>
  );
}
