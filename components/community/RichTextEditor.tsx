/**
 * BPK Hub — Rich Text Editor (Tiptap)
 * Client component wrapping Tiptap with a toolbar for community post authoring.
 */
'use client';

import { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
  Code,
  Undo2,
  Redo2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/api/upload';

// ── Types ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  /** HTML string to initialize the editor (edit mode) */
  initialContent?: string;
  /** Called whenever the editor content changes with the HTML string */
  onChange: (html: string) => void;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Additional class names for the editor wrapper */
  className?: string;
}

// ── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        active && 'bg-accent text-accent-foreground',
      )}
    >
      {children}
    </button>
  );
}

// ── Editor Component ─────────────────────────────────────────────────────────

export function RichTextEditor({
  initialContent,
  onChange,
  placeholder = '내용을 입력해주세요...',
  className,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-md max-w-full my-2' },
      }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none',
      },
    },
    // Prevent SSR hydration mismatch
    immediatelyRender: false,
  });

  // ── Link insertion ──────────────────────────────────────────────────────
  const handleLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('링크 URL을 입력하세요', previousUrl ?? 'https://');
    if (url === null) return; // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    }
  }, [editor]);

  // ── Image upload ────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor || !e.target.files?.length) return;
      const file = e.target.files[0];

      // Basic client-side validation
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하만 가능합니다.');
        return;
      }

      setUploading(true);
      try {
        const { url } = await uploadFile(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        alert(
          err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.',
        );
      } finally {
        setUploading(false);
        // Reset input so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [editor],
  );

  if (!editor) {
    return (
      <div
        className={cn(
          'rounded-md border border-input bg-background',
          className,
        )}
      >
        <div className="flex h-10 items-center border-b bg-muted/50 px-2">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="min-h-[200px] px-4 py-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 px-2 py-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="굵게 (Bold)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="기울임 (Italic)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          title="제목 H2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
          title="제목 H3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="글머리 기호 목록"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="번호 목록"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={handleLink}
          active={editor.isActive('link')}
          title="링크 삽입"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="이미지 삽입"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="코드 블록"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="실행 취소"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="다시 실행"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        aria-label="이미지 파일 선택"
      />
    </div>
  );
}
