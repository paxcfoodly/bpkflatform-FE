/**
 * BPK Hub — Next.js Middleware
 * 서버사이드 라우트 보호: /admin/*, /my/* 경로는 인증 토큰 없으면 리다이렉트.
 *
 * 참고: 클라이언트에서 localStorage에 토큰을 저장하므로, 서버에서는 쿠키를 통해 확인한다.
 * 현재 구조에서는 토큰이 localStorage에만 있으므로, 서버에서 완전한 인증 검증은 불가.
 * 대신 클라이언트가 설정하는 'bpk_authenticated' 쿠키의 존재 여부로 1차 가드를 수행한다.
 * 실제 인증 검증은 BE API에서 수행된다 (이중 보호).
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** 보호 경로 패턴 */
const PROTECTED_PATHS = ['/admin', '/my', '/ai/matching'];
const AUTH_COOKIE = 'bpk_authenticated';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 보호 경로인지 확인
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // 인증 쿠키 확인
  const authCookie = request.cookies.get(AUTH_COOKIE);

  if (!authCookie) {
    // 로그인 페이지로 리다이렉트 (원래 경로를 callbackUrl로 전달)
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/my/:path*', '/ai/matching'],
};
