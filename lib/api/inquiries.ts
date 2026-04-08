/**
 * BPK Hub — Inquiry API Client
 * Typed fetch wrappers for /api/inquiries/* endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface EstimatePayload {
  company_name: string;
  name: string;
  phone: string;
  email: string;
  product_id?: string;
  equipment_interest?: string;
  title: string;
  content: string;
  privacy_agreed: boolean;
}

export interface ContactPayload {
  name: string;
  phone: string;
  email: string;
  company_name?: string;
  title: string;
  content: string;
  privacy_agreed: boolean;
}

export interface ASPayload {
  name: string;
  phone: string;
  email: string;
  company_name?: string;
  equipment_model: string;
  purchase_date?: string;
  symptom: string;
  preferred_visit_date?: string;
  privacy_agreed: boolean;
}

export interface InquiryResult {
  id: string;
  type: string;
  status: string;
  message: string;
  created_at: string;
}

interface SuccessResponse<T> {
  success: boolean;
  data: T;
  meta: { timestamp: string };
}

// ── Error ────────────────────────────────────────────────────────────────────

export class InquiryApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'InquiryApiError';
    this.status = status;
    this.code = code;
  }
}

// ── Helper ───────────────────────────────────────────────────────────────────

async function inquiryPost<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bpk_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const detail = json.detail ?? json.error?.message ?? res.statusText;
    const code = json.error?.code ?? `HTTP_${res.status}`;
    throw new InquiryApiError(res.status, code, detail);
  }

  return res.json();
}

// ── API Functions ────────────────────────────────────────────────────────────

/** 견적 요청 제출 */
export async function submitEstimate(
  payload: EstimatePayload,
): Promise<InquiryResult> {
  const res = await inquiryPost<SuccessResponse<InquiryResult>>(
    '/api/inquiries/estimate',
    payload,
  );
  return res.data;
}

/** 1:1 문의 제출 */
export async function submitContact(
  payload: ContactPayload,
): Promise<InquiryResult> {
  const res = await inquiryPost<SuccessResponse<InquiryResult>>(
    '/api/inquiries/contact',
    payload,
  );
  return res.data;
}

/** A/S 신청 제출 */
export async function submitAS(
  payload: ASPayload,
): Promise<InquiryResult> {
  const res = await inquiryPost<SuccessResponse<InquiryResult>>(
    '/api/inquiries/as',
    payload,
  );
  return res.data;
}
