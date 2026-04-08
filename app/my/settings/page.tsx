/**
 * BPK Hub — 설정 페이지 (P31)
 * /my/settings — 프로필 수정 · 비밀번호 변경 · 알림 설정 · 회원 탈퇴
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Lock, Loader2, AlertTriangle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingSpinner,
  Button,
} from '@/components/ui';
import { FormInput } from '@/components/form';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import {
  useMyProfile,
  useUpdateProfile,
  useChangePassword,
  useDeleteAccount,
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/hooks/use-my';
import { useAuthStore } from '@/stores/authStore';

// ── Zod Schemas (v4 compatible — .min() with message object) ────────────────

const profileSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요' }).max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  company_name: z.string().max(100).optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,50}$/;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, { message: '현재 비밀번호를 입력해주세요' }),
    new_password: z
      .string()
      .min(8, { message: '비밀번호는 8자 이상이어야 합니다' })
      .max(50, { message: '비밀번호는 50자 이하여야 합니다' })
      .regex(PASSWORD_REGEX, {
        message: '영문, 숫자, 특수문자를 모두 포함해주세요',
      }),
    confirm_password: z.string().min(1, { message: '비밀번호 확인을 입력해주세요' }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirm_password'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// ── Profile Section ─────────────────────────────────────────────────────────

function ProfileSection() {
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateProfile();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          name: profile.name,
          phone: profile.phone ?? '',
          company_name: profile.company_name ?? '',
        }
      : undefined,
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(
      {
        name: data.name,
        phone: data.phone || undefined,
        company_name: data.company_name || undefined,
      },
      {
        onSuccess: () => {
          toast('프로필이 수정되었습니다.', 'success');
          reset(data);
        },
        onError: () => toast('프로필 수정에 실패했습니다.', 'error'),
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 이메일 (읽기 전용) */}
          <FormInput
            label="이메일"
            value={profile?.email ?? ''}
            disabled
            readOnly
          />
          <FormInput
            label="이름"
            {...register('name')}
            error={errors.name?.message}
          />
          <FormInput
            label="전화번호"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="010-0000-0000"
          />
          <FormInput
            label="회사명"
            {...register('company_name')}
            error={errors.company_name?.message}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              저장
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Password Section ────────────────────────────────────────────────────────

function PasswordSection() {
  const changeMutation = useChangePassword();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = (data: PasswordFormData) => {
    changeMutation.mutate(
      {
        current_password: data.current_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          toast('비밀번호가 변경되었습니다.', 'success');
          reset();
        },
        onError: () => toast('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.', 'error'),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          비밀번호 변경
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="현재 비밀번호"
            type="password"
            {...register('current_password')}
            error={errors.current_password?.message}
          />
          <FormInput
            label="새 비밀번호"
            type="password"
            {...register('new_password')}
            error={errors.new_password?.message}
            helperText="8~50자, 영문·숫자·특수문자 포함"
          />
          <FormInput
            label="새 비밀번호 확인"
            type="password"
            {...register('confirm_password')}
            error={errors.confirm_password?.message}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={changeMutation.isPending}
            >
              {changeMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              변경
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Notification Settings Section (2차 개발 — 알림 인프라 고도화 후 활성화) ──
// function NotificationSettingsSection() { ... }
/*
const NOTIFICATION_LABELS: { key: keyof import('@/lib/api/my').NotificationSettings; label: string; description: string }[] = [
  { key: 'email_notification', label: '이메일 알림', description: '이메일로 알림을 받습니다' },
  { key: 'announcement_alert', label: '공고 알림', description: '새로운 공고가 등록되면 알려드립니다' },
  { key: 'price_alert', label: '시세 알림', description: '관심 품목의 시세 변동 시 알려드립니다' },
  { key: 'comment_reply_alert', label: '댓글/답글 알림', description: '내 게시글에 댓글이 달리면 알려드립니다' },
  { key: 'inquiry_status_alert', label: '문의 상태 알림', description: '문의 처리 상태가 변경되면 알려드립니다' },
];

function NotificationSettingsSection() {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings();
  const { toast } = useToast();

  const handleToggle = (key: keyof import('@/lib/api/my').NotificationSettings, value: boolean) => {
    updateMutation.mutate(
      { [key]: value },
      {
        onError: () => toast('알림 설정 변경에 실패했습니다.', 'error'),
      },
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {NOTIFICATION_LABELS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={settings?.[key] ?? false}
                onChange={(val) => handleToggle(key, val)}
                disabled={updateMutation.isPending}
                label={label}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
*/

// ── Delete Account Section ──────────────────────────────────────────────────

function DeleteAccountSection() {
  const router = useRouter();
  const logoutAction = useAuthStore((s) => s.logoutAction);
  const deleteMutation = useDeleteAccount();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');

  const resetModal = () => {
    setPassword('');
    setReason('');
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!password) return;
    deleteMutation.mutate(
      { password, reason: reason || undefined },
      {
        onSuccess: async () => {
          resetModal();
          toast('회원 탈퇴가 완료되었습니다.', 'success');
          await logoutAction();
          router.push('/');
        },
        onError: () => toast('회원 탈퇴에 실패했습니다. 비밀번호를 확인해주세요.', 'error'),
      },
    );
  };

  return (
    <>
      {/* 트리거 버튼 */}
      <div className="flex justify-start pt-4">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-xs text-muted-foreground underline hover:text-destructive transition-colors"
        >
          회원 탈퇴
        </button>
      </div>

      {/* 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 오버레이 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={resetModal}
          />
          {/* 모달 카드 */}
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-background border shadow-xl">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-lg font-semibold">회원 탈퇴</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
              <FormInput
                label="비밀번호 확인"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력해주세요"
              />
              <FormInput
                label="탈퇴 사유 (선택)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="탈퇴 사유를 입력해주세요"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetModal}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!password || deleteMutation.isPending}
                  onClick={handleDelete}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="mr-2 h-4 w-4" />
                  )}
                  탈퇴하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>
      <ProfileSection />
      <PasswordSection />
      {/* <NotificationSettingsSection /> — 2차 개발 시 활성화 */}
      <DeleteAccountSection />
    </div>
  );
}
