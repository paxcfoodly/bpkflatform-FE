/**
 * BPK Hub — 개인정보 수집 동의 안내 텍스트
 */

export function PrivacyNotice() {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">개인정보 수집·이용 동의</p>
      <ul className="list-inside list-disc space-y-1">
        <li>수집 항목: 이름, 연락처, 이메일, 회사명</li>
        <li>수집 목적: 문의 접수 및 회신, 견적 안내</li>
        <li>보유 기간: 문의 처리 완료 후 1년</li>
        <li>동의를 거부하실 수 있으며, 거부 시 문의 접수가 제한됩니다.</li>
      </ul>
    </div>
  );
}
