'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, Package, Loader2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { postAiMatch, type AiMatchResponse } from '@/lib/api/ai';
import { cn } from '@/lib/utils';

export default function AiMatchingPage() {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [unitWeight, setUnitWeight] = useState('');
  const [dailyProd, setDailyProd] = useState('');
  const [enableVerification, setEnableVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiMatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [converting, setConverting] = useState(false);

  const processFile = useCallback(async (
    f: File,
    setFileState: (f: File) => void,
    setPreviewState: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    setResult(null);
    setError(null);

    // 이전 preview URL 해제 (메모리 누수 방지)
    setPreviewState((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return prev;
    });

    const isHeic = f.type === 'image/heic' || f.type === 'image/heif'
      || f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif');

    if (isHeic) {
      setConverting(true);
      try {
        const { heicTo } = await import('heic-to');
        const blob = await heicTo({ blob: f, type: 'image/jpeg', quality: 0.85 });
        const converted = new File(
          [blob as Blob],
          f.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
          { type: 'image/jpeg' },
        );
        setFileState(converted);
        setPreviewState(URL.createObjectURL(converted));
      } catch (err: any) {
        console.error('HEIC conversion error:', err);
        setError(`HEIC 이미지 변환에 실패했습니다: ${err?.message || err}. JPG 또는 PNG로 변환 후 업로드해주세요.`);
      } finally {
        setConverting(false);
      }
      return;
    }

    setFileState(f);
    setPreviewState(URL.createObjectURL(f));
  }, []);

  const handleFrontFile = useCallback((f: File) => processFile(f, setFrontFile, setFrontPreview), [processFile]);
  const handleBackFile = useCallback((f: File) => processFile(f, setBackFile, setBackPreview), [processFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent, side: 'front' | 'back') => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (!f) return;
      const isImage = f.type.startsWith('image/');
      const isHeic = /\.heic$/i.test(f.name) || /\.heif$/i.test(f.name);
      if (isImage || isHeic) {
        if (side === 'front') handleFrontFile(f);
        else handleBackFile(f);
      }
    },
    [handleFrontFile, handleBackFile],
  );

  const handleSubmit = async () => {
    if (!frontFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await postAiMatch(
        frontFile,
        unitWeight ? Number(unitWeight) : undefined,
        dailyProd ? Number(dailyProd) : undefined,
        enableVerification,
        backFile,
      );
      if (!res.success && res.error) {
        // 사용자 친화적 에러 메시지 변환
        const msg = res.error.includes('INVALID_ARGUMENT')
          ? '이미지를 인식할 수 없습니다. 포장 제품이 잘 보이는 다른 이미지를 사용해주세요.'
          : res.error.includes('이미지 분석 실패')
            ? '이미지 분석에 실패했습니다. 다른 이미지로 다시 시도해주세요.'
            : res.error;
        setError(msg);
      } else if (!res.analysis) {
        setError('분석 결과를 받지 못했습니다. 다시 시도해주세요.');
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFrontFile(null);
    setFrontPreview(null);
    setBackFile(null);
    setBackPreview(null);
    setResult(null);
    setError(null);
    setUnitWeight('');
    setDailyProd('');
    setEnableVerification(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          AI 포장장비 매칭
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">
          포장 이미지로 장비 추천받기
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-balance">
          제품 포장의 앞면·뒷면 이미지를 업로드하면 AI가 포장형태를 분석하고,{" "}
          최적의 포장장비를 추천해드립니다.
        </p>
      </div>

      {/* Upload & Options */}
      {!result && (
        <div className="space-y-6">
          {/* 앞면 + 뒷면 이미지 업로드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 앞면 (필수) */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                앞면 이미지 <span className="text-destructive">*</span>
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'front')}
                onClick={() => frontInputRef.current?.click()}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer min-h-[200px]',
                  frontPreview
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
                )}
              >
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFrontFile(f);
                  }}
                />
                {converting ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">변환 중...</p>
                  </div>
                ) : frontPreview ? (
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={frontPreview} alt="앞면" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">앞면 사진</p>
                    <p className="text-xs text-muted-foreground mt-1">필수</p>
                  </>
                )}
              </div>
            </div>

            {/* 뒷면 (선택) */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                뒷면 이미지 <span className="text-muted-foreground font-normal">(권장)</span>
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'back')}
                onClick={() => backInputRef.current?.click()}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer min-h-[200px]',
                  backPreview
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
                )}
              >
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleBackFile(f);
                  }}
                />
                {backPreview ? (
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={backPreview} alt="뒷면" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">뒷면 사진</p>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      실링 구조를 직접 확인하여<br />정확도가 대폭 향상됩니다
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {(frontPreview || backPreview) && (
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground underline">
              이미지 다시 선택
            </button>
          )}

          {/* Optional inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                포장 단위 중량/용량 (g 또는 ml)
                <span className="text-destructive ml-1">*</span>
              </label>
              <input
                type="number"
                placeholder="예: 500"
                value={unitWeight}
                onChange={(e) => setUnitWeight(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                일일 생산량 (개)
                <span className="text-muted-foreground font-normal ml-1">선택</span>
              </label>
              <input
                type="number"
                placeholder="예: 5000"
                value={dailyProd}
                onChange={(e) => setDailyProd(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              중량과 생산량을 입력하면 자동화 수준(수동/반자동/자동)을 판단하여 더 정확한 장비를 추천합니다.
            </span>
          </div>

          {/* 2차 검증 옵션 */}
          <label className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">AI 2차 검증</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">정확도 UP</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI가 1차 분석 결과를 비판적으로 재검토하여 오분류를 교정합니다
              </p>
            </div>
            <div
              role="switch"
              aria-checked={enableVerification}
              onClick={() => setEnableVerification(!enableVerification)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4',
                enableVerification ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  enableVerification ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </div>
          </label>

          {/* Submit */}
          <Button
            variant="cta"
            size="lg"
            className="w-full"
            disabled={!frontFile || !unitWeight || loading || converting}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI 매칭 시작
              </>
            )}
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 mt-2">
          {result.demo && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
              <Info className="h-4 w-4 flex-shrink-0" />
              데모 모드 — GEMINI_API_KEY를 설정하면 실제 AI 분석이 동작합니다.
            </div>
          )}

          {/* Analysis card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                포장형태 분석 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {result.analysis.packaging_type_kr}
                </div>
                <div className="rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground">
                  정확도 {(result.analysis.confidence * 100).toFixed(0)}%
                </div>
                {result.analysis.has_back_image && (
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300">
                    ✅ 뒷면 분석 포함
                  </div>
                )}

              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.analysis.reasoning}
              </p>
              {result.user_input && result.user_input.automation_level !== '미정' && (
                <div className="text-sm">
                  <span className="text-muted-foreground">추천 자동화 수준: </span>
                  <span className="font-medium">{result.user_input.automation_level}</span>
                </div>
              )}

              {/* 2차 검증 결과 */}
              {result.analysis.verification && (
                <div className={cn(
                  'rounded-lg border p-3 text-sm',
                  result.analysis.verification.verified
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
                    : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
                )}>
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <span>{result.analysis.verification.verified ? '✅' : '🔄'}</span>
                    <span>
                      {result.analysis.verification.verified
                        ? 'AI 2차 검증 통과'
                        : `AI 2차 검증에서 수정됨: ${result.analysis.verification.original_type} → ${result.analysis.verification.corrected_type_kr}`
                      }
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {result.analysis.verification.verification_reasoning}
                  </p>
                  {result.analysis.verification.issues_found.length > 0 && (
                    <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                      {result.analysis.verification.issues_found.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment matches */}
          {result.matching && result.matching.main_equipment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>추천 장비</CardTitle>
                <CardDescription>
                  포장형태 · 중량 · 생산량 기반 매칭 결과
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.matching.main_equipment.map((eq) => (
                    <div
                      key={eq.id}
                      className="flex items-start justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{eq.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {eq.category_minor}
                        </div>
                        {eq.reasons && eq.reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {eq.reasons.map((r, i) => (
                              <span key={i} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-primary text-sm">{eq.price}</div>
                        {eq.score !== undefined && (
                          <div className="text-xs text-muted-foreground mt-1">
                            매칭 {eq.score}점
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auxiliary equipment */}
          {result.matching && result.matching.auxiliary_equipment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>보조 장비</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.matching.auxiliary_equipment.map((eq) => (
                    <div key={eq.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <span className="font-medium">{eq.name}</span>
                      </div>
                      <span className="font-semibold text-primary">{eq.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Similar quotations — 추후 활성화 예정
          {result.matching && result.matching.similar_quotations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>유사 견적 사례</CardTitle>
                <CardDescription>과거 견적 데이터 기반 참고 자료</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.matching.similar_quotations.map((q) => (
                    <div key={q.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{q.item_detail}</span>
                        <span className="text-primary font-semibold">{q.amount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {q.client} · {q.product_type} · {q.bag_size} · {q.date}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          */}

          {/* Reasoning */}
          {result.matching?.reasoning && (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
              <strong className="text-foreground">매칭 근거:</strong> {result.matching.reasoning}
            </div>
          )}

          {/* Retry */}
          <Button variant="outline" onClick={reset} className="w-full">
            다른 이미지로 다시 분석
          </Button>
        </div>
      )}
    </div>
  );
}
