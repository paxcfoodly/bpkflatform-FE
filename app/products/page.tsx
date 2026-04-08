/**
 * BPK Hub — Product List Page (/products)
 * Category tabs, search, filters, product grid with pagination.
 */
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Skeleton';
import { ProductListContent } from './ProductListContent';

export const metadata = {
  title: '포장장비 마켓 - BPK Hub',
  description: 'BPK Hub의 다양한 포장장비를 카테고리별 필터와 검색으로 찾아보세요.',
  openGraph: {
    title: '포장장비 마켓 - BPK Hub',
    description: '다양한 포장장비를 카테고리별 필터와 검색으로 찾아보세요.',
  },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner className="min-h-[60vh]" />}>
      <ProductListContent />
    </Suspense>
  );
}
