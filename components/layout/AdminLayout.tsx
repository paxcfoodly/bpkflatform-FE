'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Megaphone,
  MessageSquare,
  Newspaper,
  Users,
  MessagesSquare,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

/** 사이드바 메뉴 항목 */
const ADMIN_NAV = [
  { label: '대시보드', href: '/admin', icon: LayoutDashboard },
  { label: '제품 관리', href: '/admin/products', icon: Package },
  { label: '공고 관리', href: '/admin/announcements', icon: Megaphone },
  { label: '문의 관리', href: '/admin/inquiries', icon: MessageSquare },
  { label: '뉴스/공지', href: '/admin/news', icon: Newspaper },
  { label: '회원 관리', href: '/admin/users', icon: Users },
  { label: '게시판 관리', href: '/admin/community', icon: MessagesSquare },
] as const;

/**
 * 관리자 전용 레이아웃 — 사이드바 + 상단 헤더
 * 모바일에서는 사이드바가 오버레이로 토글된다.
 */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logoutAction } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAction();
    router.replace('/');
  };

  /** pathname이 정확히 일치하거나 하위 경로에 해당하는지 */
  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--sidebar)]">
      {/* ── Mobile overlay backdrop ────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo / brand */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/admin"
            className="text-lg font-bold text-[var(--sidebar-primary)]"
          >
            BPK Admin
          </Link>
          <button
            className="lg:hidden text-[var(--sidebar-foreground)]"
            onClick={() => setSidebarOpen(false)}
            aria-label="사이드바 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {ADMIN_NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)]'
                  : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer — back to site */}
        <div className="border-t border-[var(--sidebar-border)] px-3 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[var(--sidebar-foreground)] hover:text-[var(--sidebar-primary)]"
          >
            ← 사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--sidebar-border)] bg-white px-4 dark:bg-gray-950 lg:px-6">
          <button
            className="lg:hidden text-gray-600 dark:text-gray-300"
            onClick={() => setSidebarOpen(true)}
            aria-label="사이드바 열기"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user?.name ?? '관리자'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="로그아웃"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
