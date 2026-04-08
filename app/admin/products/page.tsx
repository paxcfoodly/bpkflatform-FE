/**
 * BPK Hub — 관리자 제품 목록 CMS 페이지
 * /admin/products
 */
'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';

import { Button, Badge, SearchBar, ControlledPagination, Skeleton } from '@/components/ui';
import { useAdminProducts, useDeleteProduct } from '@/hooks/use-admin';
import { useCategories } from '@/hooks/use-products';
import { useToast } from '@/components/ui/Toast';
import { FormSelect, type SelectOption } from '@/components/form';
import type { AdminProductListParams } from '@/lib/api/admin';

// ── Status helpers ──────────────────────────────────────────────────────────

const STATUS_OPTIONS: SelectOption[] = [
  { label: '전체', value: '' },
  { label: '활성', value: 'ACTIVE' },
  { label: '임시저장', value: 'DRAFT' },
  { label: '비활성', value: 'INACTIVE' },
];

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'DRAFT':
      return 'warning' as const;
    case 'INACTIVE':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'ACTIVE':
      return '활성';
    case 'DRAFT':
      return '임시저장';
    case 'INACTIVE':
      return '비활성';
    default:
      return status;
  }
}

// ── Inner content (uses useSearchParams) ─────────────────────────────────────

function ProductListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Parse URL search params
  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const statusFilter = searchParams.get('status') || '';

  const [searchValue, setSearchValue] = useState(search);

  const params: AdminProductListParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(categoryId && { category_id: categoryId }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, isError, error: fetchError } = useAdminProducts(params);
  const deleteMutation = useDeleteProduct();
  const { data: categories } = useCategories();

  // Build category options
  const categoryOptions: SelectOption[] = [
    { label: '전체 카테고리', value: '' },
    ...(categories?.map((c) => ({ label: c.name, value: c.id })) || []),
  ];

  // ── Navigation helpers ──
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      // Reset to page 1 on filter change (unless the update itself is a page change)
      if (!('page' in updates)) params.set('page', '1');
      router.push(`/admin/products?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = (value: string) => {
    updateParams({ search: value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ category_id: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ status: e.target.value });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" 제품을 삭제하시겠습니까?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast('제품이 삭제되었습니다.', 'success');
    } catch {
      toast('제품 삭제에 실패했습니다.', 'error');
    }
  };

  const products = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">제품 관리</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            제품 등록
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="제품명으로 검색"
          />
        </div>
        <div className="w-48">
          <FormSelect
            options={categoryOptions}
            value={categoryId}
            onChange={handleCategoryChange}
            placeholder="카테고리"
          />
        </div>
        <div className="w-36">
          <FormSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatusChange}
            placeholder="상태"
          />
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <div className="py-12 text-center text-destructive">
          제품 목록을 불러올 수 없습니다.{' '}
          {fetchError instanceof Error ? fetchError.message : ''}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          등록된 제품이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">제품명</th>
                <th className="px-4 py-3 font-medium">카테고리</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium text-right">가격</th>
                <th className="px-4 py-3 font-medium text-right">조회수</th>
                <th className="px-4 py-3 font-medium">등록일</th>
                <th className="px-4 py-3 font-medium text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category_name ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(product.status)}>
                      {statusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.price != null
                      ? `₩${Number(product.price).toLocaleString()}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">{product.view_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(product.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/products/${product.id}`} target="_blank">
                        <Button variant="ghost" size="icon" aria-label="보기">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" aria-label="수정">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="삭제"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <ControlledPagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

// ── Page (Suspense boundary for useSearchParams) ─────────────────────────────

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ProductListContent />
    </Suspense>
  );
}
