/**
 * BPK Hub — 관리자 게시판 관리 CMS 페이지
 * /admin/community
 */
'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, Pin, PinOff, Trash2 } from 'lucide-react';

import { Button, Badge, SearchBar, ControlledPagination, Skeleton } from '@/components/ui';
import { FormSelect, type SelectOption } from '@/components/form';
import { useAdminPosts, useUpdatePostStatus, useTogglePostPin, useDeletePost } from '@/hooks/use-admin';
import type { AdminPostListParams } from '@/lib/api/admin';

const BOARD_OPTIONS: SelectOption[] = [
  { label: '전체 게시판', value: '' },
  { label: '자유게시판', value: 'FREE' },
  { label: '질문게시판', value: 'QUESTION' },
  { label: '정보공유', value: 'INFO' },
  { label: '채용/구인', value: 'JOB' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: '전체 상태', value: '' },
  { label: '활성', value: 'ACTIVE' },
  { label: '숨김', value: 'HIDDEN' },
  { label: '삭제됨', value: 'DELETED' },
];

function boardLabel(type: string) {
  switch (type) {
    case 'FREE': return '자유';
    case 'QUESTION': return '질문';
    case 'INFO': return '정보';
    case 'JOB': return '채용';
    default: return type;
  }
}

function boardBadgeVariant(type: string) {
  switch (type) {
    case 'FREE': return 'default' as const;
    case 'QUESTION': return 'info' as const;
    case 'INFO': return 'success' as const;
    case 'JOB': return 'warning' as const;
    default: return 'outline' as const;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'ACTIVE': return <Badge variant="success">활성</Badge>;
    case 'HIDDEN': return <Badge variant="warning">숨김</Badge>;
    case 'DELETED': return <Badge variant="destructive">삭제</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function PostListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const boardFilter = searchParams.get('board_type') || '';
  const statusFilter = searchParams.get('status') || '';

  const [searchValue, setSearchValue] = useState(search);

  const params: AdminPostListParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(boardFilter && { board_type: boardFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, isError, error: fetchError } = useAdminPosts(params);
  const statusMutation = useUpdatePostStatus();
  const pinMutation = useTogglePostPin();
  const deleteMutation = useDeletePost();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) p.set(key, value);
        else p.delete(key);
      });
      if (!('page' in updates)) p.set('page', '1');
      router.push(`/admin/community?${p.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = (value: string) => updateParams({ search: value });
  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParams({ board_type: e.target.value });
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParams({ status: e.target.value });
  const handlePageChange = (newPage: number) => updateParams({ page: String(newPage) });

  const handleToggleHide = (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    statusMutation.mutate({ postId, status: newStatus });
  };

  const handleTogglePin = (postId: string, isPinned: boolean) => {
    pinMutation.mutate({ postId, isPinned: !isPinned });
  };

  const handleDelete = (postId: string) => {
    if (!confirm('게시글을 삭제하시겠습니까? (소프트 삭제)')) return;
    deleteMutation.mutate(postId);
  };

  const posts = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">게시판 관리</h1>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="제목으로 검색"
          />
        </div>
        <div className="w-36">
          <FormSelect options={BOARD_OPTIONS} value={boardFilter} onChange={handleBoardChange} placeholder="게시판" />
        </div>
        <div className="w-36">
          <FormSelect options={STATUS_OPTIONS} value={statusFilter} onChange={handleStatusChange} placeholder="상태" />
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <div className="py-12 text-center text-destructive">
          게시글 목록을 불러올 수 없습니다. {fetchError instanceof Error ? fetchError.message : ''}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">게시글이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium w-20">게시판</th>
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">작성자</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium text-right">조회</th>
                <th className="px-4 py-3 font-medium text-right">좋아요</th>
                <th className="px-4 py-3 font-medium text-right">댓글</th>
                <th className="px-4 py-3 font-medium">작성일</th>
                <th className="px-4 py-3 font-medium text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Badge variant={boardBadgeVariant(p.board_type)}>{boardLabel(p.board_type)}</Badge>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 font-medium">
                    {p.is_pinned && <span className="text-primary mr-1">📌</span>}
                    <Link href={`/community/${p.board_type.toLowerCase()}/${p.id}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.author_name}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.view_count}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.like_count}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.comment_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={p.is_pinned ? '고정 해제' : '공지 고정'}
                        onClick={() => handleTogglePin(p.id, p.is_pinned)}
                        disabled={pinMutation.isPending}
                      >
                        {p.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={p.status === 'ACTIVE' ? '숨김' : '공개'}
                        onClick={() => handleToggleHide(p.id, p.status)}
                        disabled={statusMutation.isPending}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {p.status !== 'DELETED' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="삭제"
                          onClick={() => handleDelete(p.id)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

export default function AdminCommunityPage() {
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
      <PostListContent />
    </Suspense>
  );
}
