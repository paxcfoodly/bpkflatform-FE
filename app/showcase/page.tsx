'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, ProductCard } from '@/components/ui/Card';
import { Badge, DDayBadge, StatusBadge, CategoryTag } from '@/components/ui/Badge';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ControlledPagination } from '@/components/ui/Pagination';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, LoadingSpinner } from '@/components/ui/Skeleton';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { SearchBar } from '@/components/ui/SearchBar';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormRadioGroup } from '@/components/form/FormRadioGroup';

export default function ComponentShowcase() {
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');

  // ── Form validation schema ──
  const formSchema = z.object({
    name: z.string().min(2, '이름은 2자 이상 입력해주세요'),
    email: z.string().email('올바른 이메일 형식을 입력해주세요'),
    category: z.string().min(1, '카테고리를 선택해주세요'),
    message: z.string().min(10, '문의 내용은 10자 이상 입력해주세요'),
    agree: z.literal(true, { message: '약관에 동의해주세요' }),
    contactMethod: z.enum(['email', 'phone', 'both'], { message: '연락 방법을 선택해주세요' }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      category: '',
      message: '',
      agree: undefined as unknown as true,
      contactMethod: undefined as unknown as 'email',
    },
  });

  const onSubmit = (data: FormValues) => {
    toast(`폼 제출 완료: ${data.name} (${data.email})`, 'success');
  };

  const contactMethodValue = watch('contactMethod');

  // ── Sample gallery images ──
  const galleryImages = [
    { src: 'https://picsum.photos/seed/bpk1/800/600', alt: '포장기계 전면' },
    { src: 'https://picsum.photos/seed/bpk2/800/600', alt: '포장기계 측면' },
    { src: 'https://picsum.photos/seed/bpk3/800/600', alt: '포장기계 후면' },
    { src: 'https://picsum.photos/seed/bpk4/800/600', alt: '조작 패널' },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-8">
      <h1 className="text-3xl font-bold">컴포넌트 쇼케이스</h1>

      {/* ── 1. Breadcrumb ── */}
      <section data-testid="section-breadcrumb">
        <h2 className="mb-4 text-xl font-semibold">Breadcrumb</h2>
        <BreadcrumbNav
          items={[
            { label: '홈', href: '/' },
            { label: '장비마켓', href: '/equipment' },
            { label: '포장기계', href: '/equipment/packaging' },
          ]}
        />
      </section>

      {/* ── 2. Button ── */}
      <section data-testid="section-button">
        <h2 className="mb-4 text-xl font-semibold">Button</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button variant="cta" size="lg">견적문의 CTA</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </section>

      {/* ── 3. Badge ── */}
      <section data-testid="section-badge">
        <h2 className="mb-4 text-xl font-semibold">Badge / Tag</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>기본</Badge>
          <Badge variant="secondary">보조</Badge>
          <Badge variant="destructive">긴급</Badge>
          <Badge variant="outline">아웃라인</Badge>
          <Badge variant="success">성공</Badge>
          <Badge variant="warning">경고</Badge>
          <Badge variant="info">정보</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <DDayBadge daysLeft={1} />
          <DDayBadge daysLeft={5} />
          <DDayBadge daysLeft={14} />
          <DDayBadge daysLeft={0} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge status="active" />
          <StatusBadge status="pending" />
          <StatusBadge status="closed" />
          <StatusBadge status="draft" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <CategoryTag label="포장기계" />
          <CategoryTag label="식품가공" />
          <CategoryTag label="라벨링" />
        </div>
      </section>

      {/* ── 4. Card ── */}
      <section data-testid="section-card">
        <h2 className="mb-4 text-xl font-semibold">Card</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>기본 카드</CardTitle>
              <CardDescription>카드 설명 텍스트</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">카드 본문 내용이 들어갑니다.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">자세히 보기</Button>
            </CardFooter>
          </Card>

          <ProductCard
            title="자동 포장기계 XR-200"
            description="고속 자동 포장 시스템으로 시간당 200개 처리 가능"
            price="₩12,500,000"
            badge={<StatusBadge status="active" />}
          />

          <Card className="overflow-hidden">
            <CardHeader>
              <DDayBadge daysLeft={3} />
              <CardTitle className="mt-2">공고 카드</CardTitle>
              <CardDescription>포장재 납품업체 모집</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">마감까지 3일 남았습니다.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── 5. Modal ── */}
      <section data-testid="section-modal">
        <h2 className="mb-4 text-xl font-semibold">Modal / Dialog</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">모달 열기</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>확인 모달</DialogTitle>
              <DialogDescription>이 작업을 진행하시겠습니까?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">취소</Button>
              <Button>확인</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {/* ── 6. Toast ── */}
      <section data-testid="section-toast">
        <h2 className="mb-4 text-xl font-semibold">Toast 알림</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast('저장되었습니다.', 'success')}>
            성공 토스트
          </Button>
          <Button variant="outline" onClick={() => toast('처리 중 오류가 발생했습니다.', 'error')}>
            실패 토스트
          </Button>
          <Button variant="outline" onClick={() => toast('새로운 알림이 있습니다.', 'info')}>
            정보 토스트
          </Button>
        </div>
      </section>

      {/* ── 7. Pagination ── */}
      <section data-testid="section-pagination">
        <h2 className="mb-4 text-xl font-semibold">Pagination</h2>
        <ControlledPagination
          currentPage={page}
          totalPages={20}
          onPageChange={setPage}
        />
        <p className="mt-2 text-center text-sm text-muted-foreground">
          현재 페이지: {page} / 20
        </p>
      </section>

      {/* ── 8. Skeleton / Loading ── */}
      <section data-testid="section-skeleton">
        <h2 className="mb-4 text-xl font-semibold">Skeleton / Loading</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <SkeletonAvatar size="lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <SkeletonText lines={4} />
          </div>
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </section>

      {/* ── 9. Form ── */}
      <section data-testid="section-form">
        <h2 className="mb-4 text-xl font-semibold">Form 컴포넌트</h2>
        <Card className="max-w-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="demo-form">
              <FormInput
                label="이름"
                placeholder="홍길동"
                error={errors.name?.message}
                {...register('name')}
              />
              <FormInput
                label="이메일"
                type="email"
                placeholder="example@bpk.co.kr"
                error={errors.email?.message}
                {...register('email')}
              />
              <FormSelect
                label="카테고리"
                placeholder="카테고리 선택"
                error={errors.category?.message}
                options={[
                  { label: '포장기계', value: 'packaging' },
                  { label: '식품가공', value: 'food' },
                  { label: '라벨링', value: 'labeling' },
                  { label: '기타', value: 'other' },
                ]}
                {...register('category')}
              />
              <FormTextarea
                label="문의 내용"
                placeholder="문의 내용을 입력해주세요 (10자 이상)"
                error={errors.message?.message}
                {...register('message')}
              />
              <FormRadioGroup
                label="선호 연락 방법"
                error={errors.contactMethod?.message}
                options={[
                  { label: '이메일', value: 'email' },
                  { label: '전화', value: 'phone' },
                  { label: '모두 가능', value: 'both' },
                ]}
                orientation="horizontal"
                value={contactMethodValue}
                {...register('contactMethod')}
              />
              <FormCheckbox
                label="개인정보 수집 및 이용에 동의합니다"
                error={errors.agree?.message}
                {...register('agree')}
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit">제출</Button>
                <Button type="button" variant="outline" onClick={() => reset()}>초기화</Button>
              </div>
              {Object.keys(errors).length > 0 && (
                <p className="text-sm text-destructive" data-testid="form-error-summary">
                  {Object.keys(errors).length}개의 입력 오류가 있습니다.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── 10. SearchBar ── */}
      <section data-testid="section-searchbar">
        <h2 className="mb-4 text-xl font-semibold">검색 바</h2>
        <div className="max-w-md space-y-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(v) => setSearchResult(`"${v}" 검색 완료`)}
            placeholder="장비명 또는 키워드 검색"
          />
          {searchResult && (
            <p className="text-sm text-muted-foreground" data-testid="search-result">{searchResult}</p>
          )}
          <p className="text-xs text-muted-foreground">
            현재 입력: <span data-testid="search-value">{searchQuery || '(없음)'}</span>
          </p>
        </div>
      </section>

      {/* ── 11. Image Gallery ── */}
      <section data-testid="section-gallery">
        <h2 className="mb-4 text-xl font-semibold">이미지 갤러리</h2>
        <div className="max-w-lg">
          <ImageGallery images={galleryImages} />
        </div>
      </section>
    </main>
  );
}
