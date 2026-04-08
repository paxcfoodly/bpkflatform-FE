'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Bookmark, FileText, Package, Megaphone, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  ControlledPagination,
  Tabs,
  LoadingSpinner,
} from '@/components/ui';
import { useMyScraps, useDeleteScrap } from '@/hooks/use-my';
import { useToast } from '@/components/ui/Toast';
import type { ScrapListItem } from '@/lib/api/my';

const TARGET_TYPE_TABS = [
  { label: '전체', value: '' },
  { label: '공고', value: 'ANNOUNCEMENT' },
  { label: '제품', value: 'PRODUCT' },
  { label: '게시글', value: 'POST' },
] as const;

const TARGET_ICON: Record<string, typeof Bookmark> = {
  ANNOUNCEMENT: Megaphone,
  PRODUCT: Package,
  POST: FileText,
};

const TARGET_LABEL: Record<string, string> = {
  ANNOUNCEMENT: '공고',
  PRODUCT: '제품',
  POST: '게시글',
};

function ScrapCard({
  scrap,
  onDelete,
  deleting,
}: {
  scrap: ScrapListItem;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const Icon = TARGET_ICON[scrap.target_type] ?? Bookmark;
  const typeLabel = TARGET_LABEL[scrap.target_type] ?? scrap.target_type;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="shrink-0">
              {typeLabel}
            </Badge>
            <span className="truncate text-sm font-medium">
              {scrap.target?.title ?? '(삭제된 항목)'}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(scrap.created_at).toLocaleDateString('ko-KR')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDelete(scrap.id)}
          disabled={deleting}
          className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          aria-label="스크랩 삭제"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}

function ScrapsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const targetType = searchParams.get('target_type') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const { data, isLoading, error } = useMyScraps({
    target_type: targetType || undefined,
    page,
    limit: 10,
  });
  const deleteMutation = useDeleteScrap();

  const setParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/my/scraps?${params.toString()}`);
  };

  const handleDelete = (scrapId: string) => {
    deleteMutation.mutate(scrapId, {
      onSuccess: () => toast('스크랩이 해제되었습니다.', 'success'),
      onError: () => toast('스크랩 삭제에 실패했습니다.', 'error'),
    });
  };

  if (error) {
    return (
      <div className="py-20 text-center text-destructive">
        스크랩 목록을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">스크랩</h1>

      <Tabs
        items={TARGET_TYPE_TABS.map((t) => ({ ...t }))}
        activeValue={targetType}
        onChange={(val) => setParams({ target_type: val, page: '1' })}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bookmark className="mb-4 h-12 w-12 opacity-30" />
          <p>스크랩한 항목이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((scrap) => (
              <ScrapCard
                key={scrap.id}
                scrap={scrap}
                onDelete={handleDelete}
                deleting={deleteMutation.isPending}
              />
            ))}
          </div>

          <ControlledPagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(p) => setParams({ page: String(p) })}
          />
        </>
      )}
    </div>
  );
}

/**
 * 스크랩 목록 페이지 (P28).
 * useSearchParams → Suspense 래핑 필수 (Next.js 14 SSG).
 */
export default function ScrapsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ScrapsInner />
    </Suspense>
  );
}
