'use client';

import * as React from 'react';
import { createContext, useContext, useCallback, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Types ── */
type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

/* ── Context ── */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

/* ── Icons ── */
const TOAST_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-success" />,
  error: <AlertCircle className="h-5 w-5 text-destructive" />,
  info: <Info className="h-5 w-5 text-info" />,
};

const TOAST_STYLES: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-success/5',
  error: 'border-destructive/30 bg-destructive/5',
  info: 'border-info/30 bg-info/5',
};

/* ── Single Toast ── */
function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), item.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 fade-in-0 duration-300',
        TOAST_STYLES[item.variant],
      )}
    >
      {TOAST_ICONS[item.variant]}
      <p className="flex-1 text-sm font-medium">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
        aria-label="닫기"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ── Provider ── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = 'info', duration?: number) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div
        className="pointer-events-none fixed right-0 top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-auto sm:right-0 sm:top-0 sm:flex-col sm:items-end md:max-w-[420px]"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
