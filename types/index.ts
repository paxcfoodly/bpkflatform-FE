export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'buyer' | 'seller' | 'admin';
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
