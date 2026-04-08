/**
 * BPK Hub — Tabs (범용 탭 컴포넌트)
 * 가로 스크롤, 활성 탭 하단 인디케이터.
 */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface TabItem {
  label: string;
  value: string;
  href?: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeValue: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Tabs({ items, activeValue, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex overflow-x-auto border-b scrollbar-none',
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.value === activeValue;
        const tabContent = (
          <>
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {item.count}
              </span>
            )}
          </>
        );

        const tabClassName = cn(
          'relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
          'hover:text-foreground',
          isActive
            ? 'text-primary'
            : 'text-muted-foreground',
        );

        const indicator = isActive && (
          <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
        );

        if (item.href) {
          return (
            <Link
              key={item.value}
              href={item.href}
              role="tab"
              aria-selected={isActive}
              className={tabClassName}
            >
              {tabContent}
              {indicator}
            </Link>
          );
        }

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(item.value)}
            className={tabClassName}
          >
            {tabContent}
            {indicator}
          </button>
        );
      })}
    </div>
  );
}
