/**
 * BPK Hub — 1:1 문의 폼
 * /inquiry/contact
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { submitContact, InquiryApiError } from '@/lib/api/inquiries';

// ── Zod Schema ───────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요' }).max(100),
  phone: z
    .string()
    .min(9, { message: '연락처를 입력해주세요 (최소 9자)' })
    .max(20),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요' }),
  company_name: z.string().max(100).optional(),
  title: z.string().min(1, { message: '문의 제목을 입력해주세요' }).max(200),
  content: z
    .string()
    .min(10, { message: '문의 내용은 10자 이상 입력해주세요' })
    .max(5000),
  privacy_agreed: z.boolean().refine((v) => v === true, {
    message: '개인정보 수집에 동의해주세요',
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

// ── Form Component ───────────────────────────────────────────────────────────

export default function ContactPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      company_name: '',
      title: '',
      content: '',
      privacy_agreed: false,
    },
  });

  const { showLeaveModal, confirmLeave, cancelLeave } =
    useFormLeaveGuard(isDirty && !isSubmitting);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await submitContact({
        ...data,
        company_name: data.company_name || undefined,
      });
      toast('문의가 접수되었습니다', 'success');
      router.push('/inquiry/complete?type=contact');
    } catch (err) {
      if (err instanceof InquiryApiError && err.status === 429) {
        toast('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 'error');
      } else {
        toast('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-foreground">1:1 문의</h1>
        <p className="mb-8 text-muted-foreground">
          궁금한 점이 있으시면 편하게 문의해주세요. 영업일 기준 1~2일 이내 회신드리겠습니다.
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

          {/* 문의 내용 */}
          <FormInput
            label="문의 제목 *"
            placeholder="문의 제목을 입력해주세요"
            error={errors.title?.message}
            {...register('title')}
          />

          <FormTextarea
            label="문의 내용 *"
            placeholder="문의 내용을 상세히 입력해주세요 (최소 10자)"
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
            {isSubmitting ? '접수 중...' : '문의하기'}
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
