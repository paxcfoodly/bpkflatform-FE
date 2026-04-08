/**
 * BPK Hub — Reusable Image Upload Component
 * Supports file selection, drag-and-drop, upload via lib/api/upload,
 * image preview, delete, and client-side validation (image/* MIME, 10MB max).
 */
'use client';

import { useCallback, useRef, useState } from 'react';
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/api/upload';
import { useToast } from '@/components/ui/Toast';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ImageUploadProps {
  /** Current image URL (controlled) */
  value?: string;
  /** Called when the image URL changes (set to null on delete) */
  onChange: (url: string | null) => void;
  /** Label displayed above the dropzone */
  label?: string;
  /** Additional class names */
  className?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ── Component ────────────────────────────────────────────────────────────────

export function ImageUpload({
  value,
  onChange,
  label,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  // ── Validate & upload a single file ──────────────────────────────────────
  const processFile = useCallback(
    async (file: File) => {
      // Client-side MIME validation
      if (!file.type.startsWith('image/')) {
        toast('이미지 파일만 업로드할 수 있습니다.', 'error');
        return;
      }
      // Client-side size validation
      if (file.size > MAX_FILE_SIZE) {
        toast('파일 크기는 10MB 이하만 가능합니다.', 'error');
        return;
      }

      setUploading(true);
      try {
        const result = await uploadFile(file);
        onChange(result.url);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
        toast(message, 'error');
      } finally {
        setUploading(false);
      }
    },
    [onChange, toast],
  );

  // ── File input change handler ────────────────────────────────────────────
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [processFile],
  );

  // ── Drag-and-drop handlers ──────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  // ── Delete handler ──────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    onChange(null);
  }, [onChange]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* Preview state — show image + delete button */}
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="업로드된 이미지"
            className="h-40 w-40 rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={handleDelete}
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110"
            aria-label="이미지 삭제"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Dropzone state — file selection + drag-and-drop */
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
            'text-muted-foreground hover:border-primary hover:text-primary',
            dragOver && 'border-primary bg-primary/5 text-primary',
            uploading && 'pointer-events-none opacity-60',
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">업로드 중...</span>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                {dragOver ? (
                  <Upload className="h-6 w-6" />
                ) : (
                  <ImageIcon className="h-6 w-6" />
                )}
              </div>
              <span className="text-sm font-medium">
                클릭하거나 이미지를 드래그하세요
              </span>
              <span className="text-xs text-muted-foreground">
                이미지 파일, 최대 10MB
              </span>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="이미지 파일 선택"
      />
    </div>
  );
}
