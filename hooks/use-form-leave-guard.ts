/**
 * BPK Hub — 폼 이탈 방지 훅
 * 폼에 입력이 있는 상태에서 페이지를 떠나려 할 때 확인 다이얼로그를 표시합니다.
 */
'use client';

import { useEffect, useCallback, useState } from 'react';

/**
 * @param isDirty 폼에 변경사항이 있는지 여부
 * @returns { showLeaveModal, confirmLeave, cancelLeave, handleNavigation }
 */
export function useFormLeaveGuard(isDirty: boolean) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Browser native beforeunload (탭 닫기, 새로고침)
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleNavigation = useCallback(
    (href: string) => {
      if (isDirty) {
        setPendingHref(href);
        setShowLeaveModal(true);
        return false; // block
      }
      return true; // allow
    },
    [isDirty],
  );

  const confirmLeave = useCallback(() => {
    setShowLeaveModal(false);
    if (pendingHref) {
      window.location.href = pendingHref;
    }
  }, [pendingHref]);

  const cancelLeave = useCallback(() => {
    setShowLeaveModal(false);
    setPendingHref(null);
  }, []);

  return { showLeaveModal, confirmLeave, cancelLeave, handleNavigation };
}
