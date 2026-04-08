/**
 * BPK Hub — API Client
 * Central HTTP client for connecting FE to BE.
 * Uses native fetch with proper error handling & typing.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface HealthData {
  status: string;
  version: string;
  environment: string;
}

export interface AIAnalyzeRequest {
  query: string;
  budget_min?: number;
  budget_max?: number;
  category?: string;
}

export interface AIAnalyzeResult {
  query: string;
  recommendations: Array<{
    product_name: string;
    category: string;
    confidence: number;
    reason: string;
    estimated_price_range?: string;
  }>;
  analysis_summary: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Attach auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('bpk_access_token');
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null as T,
          error: json.error || {
            code: `HTTP_${response.status}`,
            message: response.statusText,
          },
        };
      }

      return json;
    } catch (error) {
      return {
        success: false,
        data: null as T,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.',
        },
      };
    }
  }

  // --- Health ---
  async getHealth(): Promise<ApiResponse<HealthData>> {
    return this.request<HealthData>('/health');
  }

  // --- AI ---
  async analyzeProduct(req: AIAnalyzeRequest): Promise<ApiResponse<AIAnalyzeResult>> {
    return this.request<AIAnalyzeResult>('/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
