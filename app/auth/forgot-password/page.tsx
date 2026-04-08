'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { FormInput } from '@/components/form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import * as authApi from '@/lib/api/auth';
import type { AuthApiError } from '@/lib/api/auth';

const forgotSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아닙니다.'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ defaultValues: { email: '' } });

  const mutation = useMutation({
    mutationFn: (data: ForgotForm) => authApi.forgotPassword(data.email),
    onSuccess: (res) => {
      toast(res.message, 'success');
    },
    onError: (err: AuthApiError) => {
      toast(err.message || '요청에 실패했습니다.', 'error');
    },
  });

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          가입 시 사용한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4" noValidate>
        <FormInput
          label="이메일"
          type="email"
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
          재설정 링크 발송
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
