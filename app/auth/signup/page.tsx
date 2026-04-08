'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { FormInput } from '@/components/form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import * as authApi from '@/lib/api/auth';
import type { AuthApiError } from '@/lib/api/auth';

// ── Zod Schema ───────────────────────────────────────────────────────────────

const signupSchema = z
  .object({
    email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아닙니다.'),
    name: z.string().min(2, '이름은 2자 이상이어야 합니다.').max(100),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .regex(/[a-zA-Z]/, '영문을 포함해야 합니다.')
      .regex(/[0-9]/, '숫자를 포함해야 합니다.')
      .regex(/[^a-zA-Z0-9]/, '특수문자를 포함해야 합니다.'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    phone: z.string().optional(),
    company_name: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type SignupForm = z.infer<typeof signupSchema>;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    defaultValues: {
      email: '',
      name: '',
      password: '',
      passwordConfirm: '',
      phone: '',
      company_name: '',
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupForm) =>
      authApi.signup({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone || undefined,
        company_name: data.company_name || undefined,
      }),
    onSuccess: () => {
      toast('회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.', 'success');
      router.push('/auth/login?registered=true');
    },
    onError: (err: AuthApiError) => {
      toast(err.message || '회원가입에 실패했습니다.', 'error');
    },
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          BPK Hub에 가입하고 식품제조업 커뮤니티에 참여하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput
          label="이메일 *"
          type="email"
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <FormInput
          label="이름 *"
          placeholder="홍길동"
          error={errors.name?.message}
          {...register('name')}
        />

        <FormInput
          label="비밀번호 *"
          type="password"
          placeholder="영문, 숫자, 특수문자 포함 8자 이상"
          error={errors.password?.message}
          {...register('password')}
        />

        <FormInput
          label="비밀번호 확인 *"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          error={errors.passwordConfirm?.message}
          {...register('passwordConfirm')}
        />

        <FormInput
          label="전화번호"
          type="tel"
          placeholder="010-0000-0000"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <FormInput
          label="회사명"
          placeholder="(주) BPK"
          error={errors.company_name?.message}
          {...register('company_name')}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={signupMutation.isPending}
        >
          가입하기
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{' '}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
