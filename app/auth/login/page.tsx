'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FormInput } from '@/components/form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import * as authApi from '@/lib/api/auth';
import type { AuthApiError } from '@/lib/api/auth';

// ── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

type LoginForm = z.infer<typeof loginSchema>;

// ── Inner Component (needs Suspense for useSearchParams) ─────────────────────

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { loginSuccess } = useAuthStore();

  const justRegistered = searchParams.get('registered') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => authApi.login(data),
    onSuccess: (res) => {
      loginSuccess(res.user, res.tokens);
      toast(`${res.user.name}님, 환영합니다!`, 'success');
      router.push('/');
    },
    onError: (err: AuthApiError) => {
      if (err.status === 423) {
        toast('계정이 잠겼습니다. 30분 후 다시 시도해주세요.', 'error');
      } else {
        toast(err.message || '로그인에 실패했습니다.', 'error');
      }
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          BPK Hub에 로그인하세요.
        </p>
      </div>

      {justRegistered && (
        <div className="mb-4 rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm text-foreground">
          회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput
          label="이메일"
          type="email"
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <FormInput
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={loginMutation.isPending}
        >
          로그인
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        아직 계정이 없으신가요?{' '}
        <Link
          href="/auth/signup"
          className="font-medium text-primary hover:underline"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}

// ── Page Export ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
