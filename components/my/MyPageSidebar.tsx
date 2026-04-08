'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bookmark,
  MessageSquare,
  FileText,
  Settings,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** 마이페이지 사이드바 메뉴 항목 */
const MY_NAV = [
  { label: '마이페이지', href: '/my', icon: LayoutDashboard },
  { label: '스크랩', href: '/my/scraps', icon: Bookmark },
  { label: '문의내역', href: '/my/inquiries', icon: MessageSquare },
  { label: '내 게시글', href: '/my/posts', icon: FileText },
  { label: '회원정보 수정', href: '/my/settings', icon: Settings },
  { label: '알림', href: '/my/notifications', icon: Bell },
] as const;

/**
 * 마이페이지 사이드 네비게이션.
 * 데스크톱: 왼쪽 고정 사이드바, 모바일: 상단 가로 스크롤 탭.
 */
export function MyPageSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/my') return pathname === '/my';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-60 lg:shrink-0">
        <nav className="sticky top-20 space-y-1">
          {MY_NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile horizontal tabs */}
      <div className="mb-4 overflow-x-auto border-b lg:hidden">
        <nav className="flex min-w-max gap-1 px-1 py-1">
          {MY_NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
