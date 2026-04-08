/**
 * BPK Hub — A/S 신청 폼
 * /inquiry/as
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wrench, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { FormInput, FormTextarea, FormCheckbox } from '@/components/form';
import { PrivacyNotice } from '@/components/inquiry/PrivacyNotice';
import { LeaveConfirmModal } from '@/components/inquiry/LeaveConfirmModal';
import { useFormLeaveGuard } from '@/hooks/use-form-leave-guard';
import { submitAS, InquiryApiError } from '@/lib/api/inquiries';

// ── Zod Schema ───────────────────────────────────────────────────────────────

const asSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요' }).max(100),
  phone: z
    .string()
    .min(9, { message: '연락처를 입력해주세요 (최소 9자)' })
    .max(20),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요' }),
  company_name: z.string().max(100).optional(),
  equipment_model: z
    .string()
    .min(1, { message: '장비명/모델명을 입력해주세요' })
    .max(100),
  purchase_date: z.string().optional(),
  symptom: z
    .string()
    .min(10, { message: '증상/문의 내용은 10자 이상 입력해주세요' })
    .max(5000),
  preferred_visit_date: z.string().optional(),
  privacy_agreed: z.boolean().refine((v) => v === true, {
    message: '개인정보 수집에 동의해주세요',
  }),
});

type ASFormData = z.infer<typeof asSchema>;

// ── Form Component ───────────────────────────────────────────────────────────

export default function ASPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ASFormData>({
    resolver: zodResolver(asSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      company_name: '',
      equipment_model: '',
      purchase_date: '',
      symptom: '',
      preferred_visit_date: '',
      privacy_agreed: false,
    },
  });

  const { showLeaveModal, confirmLeave, cancelLeave } =
    useFormLeaveGuard(isDirty && !isSubmitting);

  const onSubmit = async (data: ASFormData) => {
    setIsSubmitting(true);
    try {
      await submitAS({
        ...data,
        company_name: data.company_name || undefined,
        purchase_date: data.purchase_date || undefined,
        preferred_visit_date: data.preferred_visit_date || undefined,
      });
      toast('A/S 신청이 접수되었습니다', 'success');
      router.push('/inquiry/complete?type=as');
    } catch (err) {
      if (err instanceof InquiryApiError && err.status === 429) {
        toast('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 'error');
      } else {
        toast('A/S 신청 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-foreground">A/S 신청</h1>
        <p className="mb-8 text-muted-foreground">
          장비 A/S를 신청해주세요. 영업일 기준 1~2일 이내 담당자가 연락드리겠습니다.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* 기본 정보 */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="이름 *"
              placeholder="홍길동"
              error={errors.name?.message}
              {...register('name')}
            />
            <FormInput
              label="회사명"
              placeholder="(주)비피케이 (선택)"
              error={errors.company_name?.message}
              {...register('company_name')}
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

          {/* 장비 정보 */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="장비명/모델명 *"
              placeholder="예: BPK-3000 자동포장기"
              error={errors.equipment_model?.message}
              {...register('equipment_model')}
            />
            <FormInput
              label="구매 연도"
              placeholder="예: 2023"
              helperText="대략적인 구매 시기를 입력해주세요"
              error={errors.purchase_date?.message}
              {...register('purchase_date')}
            />
          </div>

          <FormInput
            label="희망 방문일"
            type="date"
            helperText="A/S 기사 방문 희망일을 선택해주세요"
            error={errors.preferred_visit_date?.message}
            {...register('preferred_visit_date')}
          />

          {/* 증상 */}
          <FormTextarea
            label="증상/문의 내용 *"
            placeholder="장비 이상 증상을 상세히 설명해주세요 (최소 10자)"
            rows={6}
            error={errors.symptom?.message}
            {...register('symptom')}
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
              <Wrench className="h-5 w-5" />
            )}
            {isSubmitting ? '신청 중...' : 'A/S 신청하기'}
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
