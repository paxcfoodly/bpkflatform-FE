'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  /** 현재 검색어 (controlled) */
  value?: string;
  /** 검색어 변경 콜백 */
  onChange?: (value: string) => void;
  /** 검색 실행 콜백 (Enter 또는 돋보기 클릭) */
  onSearch?: (value: string) => void;
  /** placeholder */
  placeholder?: string;
  /** 추가 className */
  className?: string;
  /** 비활성화 */
  disabled?: boolean;
}

function SearchBar({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = '검색어를 입력하세요',
  className,
  disabled,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState('');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(currentValue);
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue('');
    onChange?.('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      data-testid="search-bar"
    >
      <button
        type="submit"
        disabled={disabled}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="검색"
      >
        <Search className="h-5 w-5" />
      </button>
      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        aria-label="검색어 입력"
      />
      {currentValue && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="검색어 지우기"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

export { SearchBar };
