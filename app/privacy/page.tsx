import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보처리방침 — BPK Hub',
  description:
    'BPK Hub 개인정보처리방침. 개인정보의 수집·이용·보관·파기 등에 관한 사항을 안내합니다.',
  openGraph: {
    title: '개인정보처리방침 — BPK Hub',
    description: 'BPK Hub 개인정보처리방침 안내.',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <section>
        <h1 className="mb-8 text-3xl font-bold text-foreground">
          개인정보처리방침
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">
          시행일: 2025년 1월 1일 | 최종 수정일: 2025년 1월 1일
        </p>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            비피케이 주식회사(이하 &quot;회사&quot;)는 「개인정보 보호법」 등
            관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을
            신속하고 원활하게 처리하기 위하여 다음과 같이
            개인정보처리방침을 수립·공개합니다.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제1조 (개인정보의 수집 항목 및 방법)
            </h2>
            <p className="text-muted-foreground">
              회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
            </p>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              <li>
                <strong>필수 항목:</strong> 이름, 이메일 주소, 비밀번호, 연락처
              </li>
              <li>
                <strong>선택 항목:</strong> 회사명, 사업자등록번호, 직책
              </li>
              <li>
                <strong>자동 수집:</strong> IP 주소, 쿠키, 서비스 이용 기록, 접속
                로그
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제2조 (개인정보의 수집 및 이용 목적)
            </h2>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              <li>회원가입 및 본인 확인</li>
              <li>서비스 제공 및 운영</li>
              <li>문의 응대 및 고객 지원</li>
              <li>마케팅 및 광고 활용 (동의한 경우에 한함)</li>
              <li>서비스 개선을 위한 통계 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제3조 (개인정보의 보유 및 이용 기간)
            </h2>
            <p className="text-muted-foreground">
              회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체
              없이 파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우 아래와
              같이 보관합니다.
            </p>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              <li>계약 또는 청약철회 기록: 5년 (전자상거래법)</li>
              <li>대금결제 및 재화 공급 기록: 5년 (전자상거래법)</li>
              <li>소비자 불만 또는 분쟁처리 기록: 3년 (전자상거래법)</li>
              <li>웹사이트 방문 기록: 3개월 (통신비밀보호법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제4조 (개인정보의 제3자 제공)
            </h2>
            <p className="text-muted-foreground">
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만,
              이용자의 동의가 있거나 법령에 의한 경우는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제5조 (개인정보의 파기)
            </h2>
            <p className="text-muted-foreground">
              회사는 개인정보의 보유 기간이 경과하거나 처리 목적이 달성된 때에는
              지체 없이 해당 개인정보를 파기합니다. 전자적 파일 형태의 정보는 복구
              및 재생할 수 없도록 기술적 방법을 사용하여 완전히 삭제하며, 종이에
              출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제6조 (이용자의 권리와 행사 방법)
            </h2>
            <p className="text-muted-foreground">
              이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리 정지
              요구 등의 권리를 행사할 수 있습니다. 권리 행사는 서면, 전자우편 등을
              통하여 하실 수 있으며, 회사는 이에 대해 지체 없이 조치합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제7조 (개인정보 보호책임자)
            </h2>
            <ul className="list-none space-y-1 pl-0 text-muted-foreground">
              <li>
                <strong>담당 부서:</strong> 개인정보 보호 담당부서
              </li>
              <li>
                <strong>연락처:</strong>{' '}
                <Link
                  href="/inquiry/contact"
                  className="text-primary underline hover:text-primary/80"
                >
                  문의하기
                </Link>
                를 통해 연락 바랍니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제8조 (개인정보 자동 수집 장치의 설치·운영 및 거부)
            </h2>
            <p className="text-muted-foreground">
              회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키(cookie)를
              사용합니다. 이용자는 웹 브라우저의 설정을 통해 쿠키의 설치를
              거부하거나 삭제할 수 있습니다. 다만, 쿠키 설치를 거부할 경우 일부
              서비스 이용에 어려움이 있을 수 있습니다.
            </p>
          </section>

          <div className="mt-12 rounded-lg border border-border bg-muted/50 p-6">
            <p className="text-sm text-muted-foreground">
              본 개인정보처리방침은 플레이스홀더 샘플이며, 실제 법률 검토 후
              교체될 예정입니다. 문의 사항은{' '}
              <Link
                href="/inquiry/contact"
                className="text-primary underline hover:text-primary/80"
              >
                문의하기
              </Link>
              를 이용해 주세요.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
