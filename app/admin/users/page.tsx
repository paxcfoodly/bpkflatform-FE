/**
 * BPK Hub — 관리자 회원 관리 CMS 페이지
 * /admin/users
 */
'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ShieldAlert } from 'lucide-react';

import { Button, Badge, SearchBar, ControlledPagination, Skeleton } from '@/components/ui';
import { FormSelect, type SelectOption } from '@/components/form';
import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole } from '@/hooks/use-admin';
import type { AdminUserListParams } from '@/lib/api/admin';

const ROLE_OPTIONS: SelectOption[] = [
  { label: '전체 역할', value: '' },
  { label: '일반회원', value: 'USER' },
  { label: '관리자', value: 'ADMIN' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: '전체 상태', value: '' },
  { label: '활성', value: 'ACTIVE' },
  { label: '대기', value: 'PENDING' },
  { label: '정지', value: 'SUSPENDED' },
  { label: '탈퇴', value: 'WITHDRAWN' },
];

function roleBadge(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return <Badge variant="destructive">슈퍼관리자</Badge>;
    case 'ADMIN':
      return <Badge variant="info">관리자</Badge>;
    default:
      return <Badge variant="outline">일반</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">활성</Badge>;
    case 'PENDING':
      return <Badge variant="warning">대기</Badge>;
    case 'SUSPENDED':
      return <Badge variant="destructive">정지</Badge>;
    case 'WITHDRAWN':
      return <Badge variant="secondary">탈퇴</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function UserListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const roleFilter = searchParams.get('role') || '';
  const statusFilter = searchParams.get('status') || '';

  const [searchValue, setSearchValue] = useState(search);

  const params: AdminUserListParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(roleFilter && { role: roleFilter }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, isError, error: fetchError } = useAdminUsers(params);
  const statusMutation = useUpdateUserStatus();
  const roleMutation = useUpdateUserRole();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) p.set(key, value);
        else p.delete(key);
      });
      if (!('page' in updates)) p.set('page', '1');
      router.push(`/admin/users?${p.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = (value: string) => updateParams({ search: value });
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParams({ role: e.target.value });
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParams({ status: e.target.value });
  const handlePageChange = (newPage: number) => updateParams({ page: String(newPage) });

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`회원 상태를 ${newStatus === 'ACTIVE' ? '활성' : '정지'}(으)로 변경하시겠습니까?`)) return;
    statusMutation.mutate({ userId, status: newStatus });
  };

  const handleToggleRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER';
    if (!confirm(`회원 역할을 ${newRole === 'ADMIN' ? '관리자' : '일반회원'}(으)로 변경하시겠습니까?`)) return;
    roleMutation.mutate({ userId, role: newRole });
  };

  const users = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">회원 관리</h1>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="이름·이메일·회사명으로 검색"
          />
        </div>
        <div className="w-36">
          <FormSelect options={ROLE_OPTIONS} value={roleFilter} onChange={handleRoleChange} placeholder="역할" />
        </div>
        <div className="w-36">
          <FormSelect options={STATUS_OPTIONS} value={statusFilter} onChange={handleStatusChange} placeholder="상태" />
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <div className="py-12 text-center text-destructive">
          회원 목록을 불러올 수 없습니다. {fetchError instanceof Error ? fetchError.message : ''}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">등록된 회원이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">이름</th>
                <th className="px-4 py-3 font-medium">이메일</th>
                <th className="px-4 py-3 font-medium">회사명</th>
                <th className="px-4 py-3 font-medium">역할</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">인증</th>
                <th className="px-4 py-3 font-medium">가입일</th>
                <th className="px-4 py-3 font-medium text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.company_name ?? '-'}</td>
                  <td className="px-4 py-3">{roleBadge(u.role)}</td>
                  <td className="px-4 py-3">{statusBadge(u.status)}</td>
                  <td className="px-4 py-3">
                    {u.email_verified ? (
                      <span className="text-xs text-green-600">✅</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">미인증</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {u.role !== 'SUPER_ADMIN' && u.status !== 'WITHDRAWN' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={u.status === 'ACTIVE' ? '정지' : '활성화'}
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            disabled={statusMutation.isPending}
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={u.role === 'USER' ? '관리자 지정' : '일반회원으로'}
                            onClick={() => handleToggleRole(u.id, u.role)}
                            disabled={roleMutation.isPending}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        </>
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

export default function AdminUsersPage() {
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
      <UserListContent />
    </Suspense>
  );
}
