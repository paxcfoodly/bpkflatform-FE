/**
 * BPK Hub — File upload helper
 * Extracted from RichTextEditor.tsx for reuse across components (ImageUpload, etc.)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface FileUploadResponse {
  id: string;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
}

// ── Upload helper ────────────────────────────────────────────────────────────

/**
 * Upload a file to the backend file storage (S3/local).
 * Sends the file as multipart/form-data with an Authorization bearer token
 * read from `localStorage`.
 *
 * @throws {Error} with a user-friendly message on failure (including S3 503).
 */
export async function uploadFile(file: File): Promise<FileUploadResponse> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('bpk_access_token')
      : null;

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/files/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 503) {
      throw new Error('파일 저장소가 설정되지 않았습니다');
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Upload failed (${res.status})`);
  }

  const json = await res.json();
  return json.data as FileUploadResponse;
}
