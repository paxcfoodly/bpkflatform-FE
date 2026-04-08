/**
 * BPK Hub — HACCP Content (Client Component)
 * Three sections: certification step guide, institution search, FAQ accordion.
 */
'use client';

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  FileSearch,
  Building2,
  Wrench,
  Award,
  FileText,
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { BreadcrumbNav } from '@/components/ui/Breadcrumb';
import { ControlledPagination } from '@/components/ui/Pagination';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useInstitutions, useRegions, useHaccpCompanies } from '@/hooks/use-haccp';
import { ControlledPagination as CompanyPagination } from '@/components/ui/Pagination';
import type { HaccpCompany } from '@/lib/api/haccp';
import { cn } from '@/lib/utils';

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const STEPS = [
  {
    number: 1,
    title: '신청',
    description: 'HACCP 인증을 희망하는 업체가 인증기관에 신청서를 제출합니다.',
    detail: '사업자등록증, 제조공정도, 평면도 등 기본 서류를 준비하여 인증기관에 접수합니다.',
    icon: FileText,
  },
  {
    number: 2,
    title: '서류심사',
    description: '인증기관이 제출된 서류의 적합성을 검토합니다.',
    detail: 'HACCP 관리계획서, 선행요건 프로그램, 위해요소 분석 자료 등을 검토합니다.',
    icon: FileSearch,
  },
  {
    number: 3,
    title: '현장평가',
    description: '심사원이 직접 제조현장을 방문하여 위생 상태를 평가합니다.',
    detail: '제조시설, 위생관리, HACCP 7원칙 준수 여부 등을 현장에서 확인합니다.',
    icon: Building2,
  },
  {
    number: 4,
    title: '보완조치',
    description: '현장평가 결과 부적합 사항에 대해 시정 조치를 실시합니다.',
    detail: '지적된 사항을 개선하고 증빙자료를 인증기관에 제출하여 확인받습니다.',
    icon: Wrench,
  },
  {
    number: 5,
    title: '인증심사',
    description: '보완조치 확인 후 최종 인증심사위원회에서 인증 여부를 결정합니다.',
    detail: '서류심사 및 현장평가 결과를 종합하여 인증 적합 여부를 판정합니다.',
    icon: ClipboardCheck,
  },
  {
    number: 6,
    title: '인증서 발급',
    description: '심사 통과 시 HACCP 인증서가 발급됩니다 (유효기간 3년).',
    detail: '인증서 발급 후에도 연 1회 정기 조사, 3년마다 갱신 심사를 받아야 합니다.',
    icon: Award,
  },
] as const;

const CATEGORY_OPTIONS = [
  { label: '전체', value: '' },
  { label: '민간인증기관', value: '민간인증기관' },
  { label: '정부기관', value: '정부기관' },
  { label: '컨설팅', value: '컨설팅' },
  { label: '지자체지원', value: '지자체지원' },
] as const;

const FAQ_ITEMS = [
  {
    question: 'HACCP 인증 대상은 어떤 업체인가요?',
    answer:
      '식품 및 축산물을 제조·가공·조리·유통하는 모든 업체가 대상입니다. 특히 어묵, 냉동식품, 빙과류, 레토르트식품, 김치류, 음료류 등 의무 적용 품목을 생산하는 업체는 반드시 HACCP 인증을 받아야 합니다.',
  },
  {
    question: 'HACCP 인증 소요 기간은 얼마나 되나요?',
    answer:
      '업체 규모와 준비 상태에 따라 다르지만, 일반적으로 신청부터 인증서 발급까지 3~6개월이 소요됩니다. 시설 개선이 필요한 경우 추가 시간이 걸릴 수 있습니다.',
  },
  {
    question: 'HACCP 인증 비용은 얼마인가요?',
    answer:
      '인증 수수료는 업종·규모에 따라 다르며, 심사비·출장비 등을 포함하여 소규모 업체 기준 약 100~300만 원 수준입니다. 정부 지원사업을 통해 컨설팅비·시설 개선비를 지원받을 수 있습니다.',
  },
  {
    question: 'HACCP 인증 유효기간과 갱신 절차는 어떻게 되나요?',
    answer:
      '인증 유효기간은 3년이며, 기간 만료 전에 갱신 심사를 신청해야 합니다. 유효기간 중에도 매년 1회 정기 조사를 받으며, 중대한 위반 사항 발견 시 인증이 취소될 수 있습니다.',
  },
  {
    question: 'HACCP 인증을 받으면 어떤 혜택이 있나요?',
    answer:
      '식품안전관리 역량 강화, 소비자 신뢰도 향상, 관공서·대형 유통업체 납품 시 가산점, 정부 지원사업 참여 우대, 수출 시 인증 활용 등 다양한 혜택이 있습니다.',
  },
  {
    question: 'HACCP 의무 적용 대상 품목은 무엇인가요?',
    answer:
      '어묵·냉동수산식품·냉동식품·빙과류·비가열음료·레토르트식품·김치류(배추김치)·순대류 등이 의무 적용 대상입니다. 축산물의 경우 도축장, 집유업, 축산물가공업 등이 해당됩니다.',
  },
  {
    question: '소규모 업체도 HACCP 인증을 받을 수 있나요?',
    answer:
      '네, 소규모 업체를 위한 간이 HACCP 제도가 있습니다. 식약처에서 소규모 업체 전용 컨설팅을 무료로 지원하며, 시설 개선비도 보조받을 수 있습니다. 한국식품안전관리인증원 홈페이지에서 지원사업을 확인하세요.',
  },
] as const;

const BREADCRUMBS = [
  { label: '홈', href: '/' },
  { label: '정보', href: '/info' },
  { label: 'HACCP 인증', href: '/info/haccp' },
];

// ── Main Component ───────────────────────────────────────────────────────────

export function HaccpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter state from URL search params
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentRegion = searchParams.get('region') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';

  // TanStack Query hooks
  const { data: institutionData, isLoading: isLoadingInstitutions } =
    useInstitutions({
      page: currentPage,
      limit: PAGE_SIZE,
      region: currentRegion || undefined,
      category: currentCategory || undefined,
      search: currentSearch || undefined,
    });
  const { data: regions } = useRegions();

  // URL update helper
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      // Reset to page 1 when filters change
      if (!('page' in updates)) {
        params.delete('page');
      }
      router.push(`/info/haccp?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
  };

  const [searchInput, setSearchInput] = useState(currentSearch);

  const handleSearchSubmit = () => {
    updateParams({ search: searchInput });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <BreadcrumbNav items={BREADCRUMBS} className="mb-6" />

      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          HACCP 인증 정보
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          식품안전관리인증기준(HACCP) 인증 절차 안내, 인증기관 검색, 자주 묻는
          질문을 확인하세요.
        </p>
      </div>

      {/* Section 1: 인증 절차 가이드 */}
      <StepGuideSection />

      {/* Section 2: 인증기관 검색 */}
      <InstitutionSearchSection
        institutions={institutionData?.data ?? []}
        meta={institutionData?.meta}
        regions={regions ?? []}
        isLoading={isLoadingInstitutions}
        currentPage={currentPage}
        currentRegion={currentRegion}
        currentCategory={currentCategory}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onRegionChange={(v) => updateParams({ region: v })}
        onCategoryChange={(v) => updateParams({ category: v })}
        onPageChange={handlePageChange}
      />

      {/* Section 3: HACCP 인증업체 검색 (공공 API) */}
      <CompanySearchSection />

      {/* Section 4: FAQ */}
      <FAQSection />
    </main>
  );
}

// ── Section 1: Step Guide ────────────────────────────────────────────────────

function StepGuideSection() {
  return (
    <section className="mb-16" aria-labelledby="step-guide-heading">
      <h2
        id="step-guide-heading"
        className="mb-2 text-2xl font-bold text-foreground"
      >
        HACCP 인증 절차
      </h2>
      <p className="mb-8 text-muted-foreground">
        HACCP 인증은 다음 6단계를 거쳐 진행됩니다.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="group relative rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              {/* Step number badge */}
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.number}
                </span>
                <Icon className="h-5 w-5 text-primary" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {step.description}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground/80">
                {step.detail}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Section 2: Institution Search ────────────────────────────────────────────

interface InstitutionSearchProps {
  institutions: Array<{
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    region: string | null;
    category: string | null;
  }>;
  meta?: {
    page: number;
    totalPages: number;
    total: number;
  };
  regions: Array<{ region: string; count: number }>;
  isLoading: boolean;
  currentPage: number;
  currentRegion: string;
  currentCategory: string;
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  onSearchSubmit: () => void;
  onRegionChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPageChange: (page: number) => void;
}

function InstitutionSearchSection({
  institutions,
  meta,
  regions,
  isLoading,
  currentPage,
  currentRegion,
  currentCategory,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onRegionChange,
  onCategoryChange,
  onPageChange,
}: InstitutionSearchProps) {
  return (
    <section className="mb-16" aria-labelledby="institution-search-heading">
      <h2
        id="institution-search-heading"
        className="mb-2 text-2xl font-bold text-foreground"
      >
        HACCP 인증기관 검색
      </h2>
      <p className="mb-6 text-muted-foreground">
        지역, 카테고리, 기관명으로 인증기관을 검색하세요.
      </p>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Region filter */}
        <div className="flex-1 sm:max-w-[200px]">
          <label
            htmlFor="region-filter"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            지역
          </label>
          <select
            id="region-filter"
            value={currentRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">전체 지역</option>
            {regions.map((r) => (
              <option key={r.region} value={r.region}>
                {r.region} ({r.count})
              </option>
            ))}
          </select>
        </div>

        {/* Category filter */}
        <div className="flex-1 sm:max-w-[200px]">
          <label
            htmlFor="category-filter"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            카테고리
          </label>
          <select
            id="category-filter"
            value={currentCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search input */}
        <div className="flex flex-1 gap-2">
          <div className="flex-1">
            <label
              htmlFor="institution-search"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              검색
            </label>
            <div className="relative">
              <input
                id="institution-search"
                type="text"
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearchSubmit();
                }}
                placeholder="기관명, 주소 검색"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                onClick={onSearchSubmit}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="검색"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      {meta && (
        <p className="mb-4 text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{meta.total}</span>
          개 기관
        </p>
      )}

      {/* Results grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : institutions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            검색 결과가 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            다른 검색 조건을 시도해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {institutions.map((inst) => (
            <InstitutionCard key={inst.id} institution={inst} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <ControlledPagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          onPageChange={onPageChange}
          className="mt-8"
        />
      )}
    </section>
  );
}

// ── Institution Card ─────────────────────────────────────────────────────────

function InstitutionCard({
  institution,
}: {
  institution: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    region: string | null;
    category: string | null;
  };
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-5 transition-shadow hover:shadow-md',
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">
          {institution.name}
        </h3>
        {institution.category && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {institution.category}
          </span>
        )}
      </div>

      {/* Region */}
      {institution.region && (
        <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{institution.region}</span>
        </div>
      )}

      {/* Address */}
      {institution.address && (
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          {institution.address}
        </p>
      )}

      {/* Expandable detail */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mb-2 flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        aria-expanded={expanded}
      >
        {expanded ? '접기' : '상세 보기'}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-2 border-t pt-3">
          {institution.phone && (
            <a
              href={`tel:${institution.phone}`}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Phone className="h-3.5 w-3.5" />
              {institution.phone}
            </a>
          )}
          {institution.email && (
            <a
              href={`mailto:${institution.email}`}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
              {institution.email}
            </a>
          )}
          {institution.website && (
            <a
              href={institution.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80"
            >
              <Globe className="h-3.5 w-3.5" />
              웹사이트 방문
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section 3: FAQ Accordion ─────────────────────────────────────────────────

function FAQSection() {
  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-2 text-2xl font-bold text-foreground">
        자주 묻는 질문
      </h2>
      <p className="mb-6 text-muted-foreground">
        HACCP 인증에 관해 자주 묻는 질문을 확인하세요.
      </p>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-xl border bg-card transition-shadow hover:shadow-sm [&[open]]:shadow-sm"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t px-6 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

// ── Section 3: HACCP 인증업체 검색 (공공 API) ────────────────────────────────

const SIDO_OPTIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
] as const;

function CompanySearchSection() {
  const [companyInput, setCompanyInput] = useState('');
  const [sidoFilter, setSidoFilter] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchSido, setSearchSido] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching } = useHaccpCompanies({
    company: searchCompany,
    sido: searchSido,
    page: currentPage,
    limit: 12,
  });

  const handleSearch = () => {
    setSearchCompany(companyInput);
    setSearchSido(sidoFilter);
    setCurrentPage(1);
  };

  const companies = data?.data ?? [];
  const meta = data?.meta;
  const hasSearched = !!(searchCompany || searchSido);

  return (
    <section className="mb-16" aria-labelledby="company-search-heading">
      <h2
        id="company-search-heading"
        className="mb-2 text-2xl font-bold text-foreground"
      >
        HACCP 인증업체 검색
      </h2>
      <p className="mb-6 text-muted-foreground">
        공공데이터포털 연동으로 전국 HACCP 인증업체를 실시간 검색합니다.
      </p>

      {/* 검색 필터 */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 sm:max-w-[200px]">
          <label htmlFor="company-sido" className="mb-1 block text-sm font-medium text-foreground">
            지역 (시도)
          </label>
          <select
            id="company-sido"
            value={sidoFilter}
            onChange={(e) => setSidoFilter(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">전체 지역</option>
            {SIDO_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 gap-2">
          <div className="flex-1">
            <label htmlFor="company-search" className="mb-1 block text-sm font-medium text-foreground">
              업체명
            </label>
            <div className="relative">
              <input
                id="company-search"
                type="text"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="업체명을 입력하세요"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="검색"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 건수 */}
      {meta && hasSearched && (
        <p className="mb-4 text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{meta.total.toLocaleString()}</span>건
          {isFetching && <span className="ml-2 text-xs">검색 중...</span>}
        </p>
      )}

      {/* 로딩 */}
      {isLoading && hasSearched && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* 검색 전 안내 */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            업체명 또는 지역을 선택하여 검색하세요
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            예: &quot;삼양&quot;, &quot;CJ&quot;, &quot;농심&quot; 등
          </p>
        </div>
      )}

      {/* 결과 없음 */}
      {hasSearched && !isLoading && companies.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            검색 결과가 없습니다
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            다른 검색어를 시도해 보세요.
          </p>
        </div>
      )}

      {/* 결과 목록 */}
      {companies.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((item, idx) => (
            <CompanyCard key={`${item.cert_no}-${idx}`} company={item} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {meta && meta.totalPages > 1 && (
        <CompanyPagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          onPageChange={setCurrentPage}
          className="mt-8"
        />
      )}
    </section>
  );
}

function CompanyCard({ company }: { company: HaccpCompany }) {
  const isExpired = company.cert_end_date
    ? new Date(company.cert_end_date) < new Date()
    : false;

  return (
    <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">
          {company.company}
        </h3>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
            isExpired
              ? 'bg-destructive/10 text-destructive'
              : 'bg-green-100 text-green-700',
          )}
        >
          {isExpired ? '만료' : '인증유효'}
        </span>
      </div>

      {company.sido && (
        <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{company.sido} {company.sigungu}</span>
        </div>
      )}

      {company.address && (
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {company.address}
        </p>
      )}

      <div className="space-y-1 border-t pt-3 text-xs text-muted-foreground">
        {company.cert_no && (
          <p><span className="font-medium text-foreground">인증번호:</span> {company.cert_no}</p>
        )}
        {company.type_name && (
          <p><span className="font-medium text-foreground">유형:</span> {company.type_name}</p>
        )}
        {company.upjong_name && (
          <p><span className="font-medium text-foreground">업종:</span> {company.upjong_name}</p>
        )}
        {company.ceo_name && (
          <p><span className="font-medium text-foreground">대표:</span> {company.ceo_name}</p>
        )}
        <div className="flex gap-4 pt-1">
          {company.cert_date && (
            <p><span className="font-medium text-foreground">인증일:</span> {company.cert_date}</p>
          )}
          {company.cert_end_date && (
            <p><span className="font-medium text-foreground">만료일:</span> {company.cert_end_date}</p>
          )}
        </div>
      </div>
    </div>
  );
}
