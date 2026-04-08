/**
 * BPK Hub — AI Matching API Client
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface VerificationResult {
  verified: boolean;
  original_type: string;
  corrected_type: string;
  corrected_type_kr: string;
  corrected_confidence: number;
  verification_reasoning: string;
  issues_found: string[];
  latency_ms?: number;
  cost_krw?: number;
}

export interface AnalysisResult {
  packaging_type: string;
  packaging_type_kr: string;
  confidence: number;
  reasoning: string;
  estimated_content?: string;
  estimated_size?: string;
  additional_features?: string[];
  latency_ms?: number;
  cost_krw?: number;
  has_back_image?: boolean;
  verification_enabled?: boolean;
  verification?: VerificationResult | null;
}

export interface EquipmentMatch {
  id: number;
  source: string;
  name: string;
  category_minor: string;
  price: string;
  score?: number;
  reasons?: string[];
}

export interface QuotationMatch {
  id: number;
  date: string;
  client: string;
  item_detail: string;
  product_type: string;
  bag_size: string;
  amount: string;
  relevance_score: number;
}

export interface MatchingResult {
  main_equipment: EquipmentMatch[];
  auxiliary_equipment: EquipmentMatch[];
  similar_quotations: QuotationMatch[];
  reasoning: string;
}

export interface AiMatchResponse {
  success: boolean;
  demo?: boolean;
  analysis: AnalysisResult;
  user_input?: {
    unit_weight_g: number | null;
    daily_production: number | null;
    automation_level: string;
  };
  matching: MatchingResult | null;
  error?: string;
}

export async function postAiMatch(
  frontImage: File,
  unitWeightG?: number,
  dailyProduction?: number,
  enableVerification?: boolean,
  backImage?: File | null,
): Promise<AiMatchResponse> {
  const formData = new FormData();
  formData.append('front_image', frontImage);
  if (backImage) {
    formData.append('back_image', backImage);
  }
  if (unitWeightG !== undefined && unitWeightG !== null) {
    formData.append('unit_weight_g', String(unitWeightG));
  }
  if (dailyProduction !== undefined && dailyProduction !== null) {
    formData.append('daily_production', String(dailyProduction));
  }
  if (enableVerification) {
    formData.append('enable_verification', 'true');
  }

  // 인증 헤더 추가 (AI 매칭은 로그인 필수)
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bpk_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}/api/ai/match`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `AI 매칭 요청 실패 (${res.status})`);
  }

  const json = await res.json();
  return json.data as AiMatchResponse;
}
