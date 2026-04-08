/**
 * BPK Hub — Inquiry Layout
 * inquiry 하위 페이지(1:1문의, 견적요청, A/S 신청)의 공통 metadata.
 * 하위 페이지가 'use client'이므로 직접 metadata export 불가 → 부모 layout에서 설정.
 */
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '문의하기 - BPK Hub',
  description:
    '1:1 문의, 견적 요청, A/S 신청 등 BPK Hub 고객 지원 서비스를 이용하세요.',
  openGraph: {
    title: '문의하기 - BPK Hub',
    description: '1:1 문의, 견적 요청, A/S 신청 — BPK Hub 고객 지원.',
  },
};

export default function InquiryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
