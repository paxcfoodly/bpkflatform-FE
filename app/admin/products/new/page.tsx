/**
 * BPK Hub — 관리자 제품 등록 CMS 페이지
 * /admin/products/new
 */
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button, ImageUpload } from '@/components/ui';
import { FormInput, FormSelect, FormTextarea } from '@/components/form';
import { useToast } from '@/components/ui/Toast';
import { useCreateProduct } from '@/hooks/use-admin';
import { useCategories } from '@/hooks/use-products';
import type { SelectOption } from '@/components/form';

// ── Zod Schema ──────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, { message: '제품명을 입력해주세요' }).max(200),
  slug: z
    .string()
    .min(1, { message: 'slug를 입력해주세요' })
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'slug는 소문자, 숫자, 하이픈만 허용됩니다',
    }),
  category_id: z.string().min(1, { message: '카테고리를 선택해주세요' }),
  description: z.string().min(1, { message: '설명을 입력해주세요' }),
  price: z.string().optional(),
  status: z.string().min(1, { message: '상태를 선택해주세요' }),
  thumbnail_url: z.string().max(500).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const STATUS_OPTIONS: SelectOption[] = [
  { label: '임시저장', value: 'DRAFT' },
  { label: '활성', value: 'ACTIVE' },
  { label: '비활성', value: 'INACTIVE' },
];

// ── Page Component ──────────────────────────────────────────────────────────

export default function AdminProductNewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateProduct();
  const { data: categories } = useCategories();

  const categoryOptions: SelectOption[] =
    categories?.map((c) => ({ label: c.name, value: c.id })) || [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      category_id: '',
      description: '',
      price: '',
      status: 'DRAFT',
      thumbnail_url: '',
    },
  });

  const onSubmit = async (formData: ProductFormData) => {
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        slug: formData.slug,
        category_id: formData.category_id,
        description: formData.description,
        status: formData.status,
        thumbnail_url: formData.thumbnail_url || undefined,
        price: formData.price ? Number(formData.price) : undefined,
      });
      toast('제품이 등록되었습니다.', 'success');
      router.push('/admin/products');
    } catch {
      toast('제품 등록에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" aria-label="뒤로가기">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">제품 등록</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label="제품명 *"
          placeholder="제품명을 입력해주세요"
          error={errors.name?.message}
          {...register('name')}
        />

        <FormInput
          label="Slug *"
          placeholder="예: my-product-name"
          helperText="URL에 사용될 고유 식별자 (소문자, 숫자, 하이픈)"
          error={errors.slug?.message}
          {...register('slug')}
        />

        <FormSelect
          label="카테고리 *"
          placeholder="카테고리 선택"
          options={categoryOptions}
          error={errors.category_id?.message}
          {...register('category_id')}
        />

        <FormTextarea
          label="설명 *"
          placeholder="제품에 대한 설명을 입력해주세요"
          rows={6}
          error={errors.description?.message}
          {...register('description')}
        />

        <FormInput
          label="가격"
          type="number"
          placeholder="가격 (원)"
          error={errors.price?.message}
          {...register('price')}
        />

        <FormSelect
          label="상태 *"
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />

        <Controller
          name="thumbnail_url"
          control={control}
          render={({ field }) => (
            <ImageUpload
              label="썸네일 이미지"
              value={field.value || undefined}
              onChange={(url) => field.onChange(url ?? '')}
            />
          )}
        />

        {/* Actions */}
        <div className="flex items-center gap-4 border-t pt-6">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            등록
          </Button>
          <Link href="/admin/products">
            <Button variant="outline" type="button">
              취소
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
