'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './GNB';
import { useAuthStore } from '@/stores/authStore';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pathname: string;
}

export function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const { user, hydrated, logoutAction } = useAuthStore();
  const router = useRouter();
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-background transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <span className="text-2xl">BPK</span>
            <span className="text-sm font-medium text-muted-foreground">
              Hub
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={onClose}
            aria-label="메뉴 닫기"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="모바일 메뉴">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-accent',
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Actions */}
        <div className="border-t p-4 space-y-3">
          <Link
            href="/inquiry/estimate"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            견적문의
          </Link>
          {hydrated && user ? (
            <div className="flex gap-3">
              <Link
                href="/my"
                onClick={onClose}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <User className="h-4 w-4" />
                {user.name}
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logoutAction();
                  onClose();
                  router.push('/');
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                onClick={onClose}
                className="flex flex-1 items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                onClick={onClose}
                className="flex flex-1 items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
