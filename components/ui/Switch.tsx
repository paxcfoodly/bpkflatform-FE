'use client';

import { cn } from '@/lib/utils';

export interface SwitchProps {
  /** 현재 켜짐/꺼짐 상태 */
  checked: boolean;
  /** 토글 변경 핸들러 */
  onChange: (checked: boolean) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 라벨 텍스트 (접근성) */
  label?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 토글 스위치 — 알림 설정 등 on/off 제어용.
 * Tailwind transition 애니메이션 적용.
 */
export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
