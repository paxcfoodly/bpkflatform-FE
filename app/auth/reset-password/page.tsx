'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FormInput } from '@/components/form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import * as authApi from '@/lib/api/auth';
import type { AuthApiError } from '@/lib/api/auth';

const resetSchema = z
  .object({
    new_password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .regex(/[a-zA-Z]/, '영문을 포함해야 합니다.')
      .regex(/[0-9]/, '숫자를 포함해야 합니다.')
      .regex(/[^a-zA-Z0-9]/, '특수문자를 포함해야 합니다.'),
    confirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirm'],
  });

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ defaultValues: { new_password: '', confirm: '' } });

  const mutation = useMutation({
    mutationFn: (data: ResetForm) =>
      authApi.resetPassword({ token: token!, new_password: data.new_password }),
    onSuccess: () => {
      toast('비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.', 'success');
      router.push('/auth/login');
    },
    onError: (err: AuthApiError) => {
      toast(err.message || '비밀번호 재설정에 실패했습니다.', 'error');
    },
  });

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-destructive">유효하지 않은 링크</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          비밀번호 재설정 토큰이 없습니다. 이메일의 링크를 다시 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          새로운 비밀번호를 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4" noValidate>
        <FormInput
          label="새 비밀번호"
          type="password"
          placeholder="영문, 숫자, 특수문자 포함 8자 이상"
          error={errors.new_password?.message}
          {...register('new_password')}
        />

        <FormInput
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          error={errors.confirm?.message}
          {...register('confirm')}
        />

        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          비밀번호 변경
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
