/**
 * BPK Hub — 견적 요청 폼
 * /inquiry/estimate?productId=xxx
 */
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { FormInput, FormTextarea, FormCheckbox } from '@/components/form';
import { PrivacyNotice } from '@/components/inquiry/PrivacyNotice';
import { LeaveConfirmModal } from '@/components/inquiry/LeaveConfirmModal';
import { useFormLeaveGuard } from '@/hooks/use-form-leave-guard';
import { submitEstimate, InquiryApiError } from '@/lib/api/inquiries';

// ── Zod Schema ───────────────────────────────────────────────────────────────

const estimateSchema = z.object({
  company_name: z.string().min(1, { message: '회사명을 입력해주세요' }).max(100),
  name: z.string().min(1, { message: '담당자명을 입력해주세요' }).max(100),
  phone: z
    .string()
    .min(9, { message: '연락처를 입력해주세요 (최소 9자)' })
    .max(20),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요' }),
  equipment_interest: z.string().max(200).optional(),
  title: z.string().min(1, { message: '문의 제목을 입력해주세요' }).max(200),
  content: z
    .string()
    .min(10, { message: '문의 내용은 10자 이상 입력해주세요' })
    .max(5000),
  privacy_agreed: z.boolean().refine((v) => v === true, {
    message: '개인정보 수집에 동의해주세요',
  }),
});

type EstimateFormData = z.infer<typeof estimateSchema>;

// ── Form Component ───────────────────────────────────────────────────────────

function EstimateFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const productName = searchParams.get('productName');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      company_name: '',
      name: '',
      phone: '',
      email: '',
      equipment_interest: productName ?? '',
      title: productName ? `[견적문의] ${productName}` : '',
      content: '',
      privacy_agreed: false,
    },
  });

  const { showLeaveModal, confirmLeave, cancelLeave } =
    useFormLeaveGuard(isDirty && !isSubmitting);

  const onSubmit = async (data: EstimateFormData) => {
    setIsSubmitting(true);
    try {
      await submitEstimate({
        ...data,
        product_id: productId ?? undefined,
        equipment_interest: data.equipment_interest || undefined,
      });
      toast('견적 요청이 접수되었습니다', 'success');
      router.push('/inquiry/complete?type=estimate');
    } catch (err) {
      if (err instanceof InquiryApiError && err.status === 429) {
        toast('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 'error');
      } else {
        toast('견적 요청 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-foreground">견적 요청</h1>
        <p className="mb-8 text-muted-foreground">
          포장장비 견적을 요청해주세요. 영업일 기준 1~2일 이내 회신드리겠습니다.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* 회사 정보 */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="회사명 *"
              placeholder="(주)비피케이"
              error={errors.company_name?.message}
              {...register('company_name')}
            />
            <FormInput
              label="담당자명 *"
              placeholder="홍길동"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="연락처 *"
              placeholder="010-1234-5678"
              type="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <FormInput
              label="이메일 *"
              placeholder="example@company.com"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* 장비 관심 */}
          <FormInput
            label="관심 장비"
            placeholder="관심 있는 장비명을 입력해주세요"
            helperText="제품 페이지에서 견적 요청 시 자동 입력됩니다"
            error={errors.equipment_interest?.message}
            {...register('equipment_interest')}
          />

          {/* 문의 내용 */}
          <FormInput
            label="문의 제목 *"
            placeholder="견적 문의 제목을 입력해주세요"
            error={errors.title?.message}
            {...register('title')}
          />

          <FormTextarea
            label="문의 내용 *"
            placeholder="견적 요청 내용을 상세히 입력해주세요 (최소 10자)"
            rows={6}
            error={errors.content?.message}
            {...register('content')}
          />

          {/* 개인정보 동의 */}
          <PrivacyNotice />
          <FormCheckbox
            label="개인정보 수집·이용에 동의합니다 *"
            error={errors.privacy_agreed?.message}
            {...register('privacy_agreed')}
          />

          {/* 제출 */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {isSubmitting ? '요청 중...' : '견적 요청하기'}
          </Button>
        </form>
      </div>

      <LeaveConfirmModal
        open={showLeaveModal}
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </>
  );
}

export default function EstimatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <EstimateFormInner />
    </Suspense>
  );
}
