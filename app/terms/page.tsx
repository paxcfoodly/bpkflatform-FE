import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '이용약관 — BPK Hub',
  description:
    'BPK Hub 서비스 이용약관. 서비스 이용 조건, 회원의 권리와 의무, 면책 사항 등을 안내합니다.',
  openGraph: {
    title: '이용약관 — BPK Hub',
    description: 'BPK Hub 서비스 이용약관 안내.',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <section>
        <h1 className="mb-8 text-3xl font-bold text-foreground">이용약관</h1>

        <p className="mb-6 text-sm text-muted-foreground">
          시행일: 2025년 1월 1일 | 최종 수정일: 2025년 1월 1일
        </p>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제1조 (목적)
            </h2>
            <p className="text-muted-foreground">
              이 약관은 비피케이 주식회사(이하 &quot;회사&quot;)가 운영하는 BPK
              Hub(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의
              권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로
              합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제2조 (정의)
            </h2>
            <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
              <li>
                &quot;서비스&quot;란 회사가 제공하는 식품 제조 장비 마켓플레이스 및
                관련 정보 서비스를 의미합니다.
              </li>
              <li>
                &quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 회원 및
                비회원을 말합니다.
              </li>
              <li>
                &quot;회원&quot;이란 서비스에 회원등록을 하고 서비스를 이용하는
                자를 말합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제3조 (약관의 효력 및 변경)
            </h2>
            <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
              <li>
                본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게
                공지함으로써 효력이 발생합니다.
              </li>
              <li>
                회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수
                있으며, 변경된 약관은 적용일자 및 변경사유를 명시하여 공지합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제4조 (서비스의 제공)
            </h2>
            <p className="text-muted-foreground">
              회사는 다음과 같은 서비스를 제공합니다.
            </p>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              <li>식품 제조 장비 정보 제공 및 거래 중개</li>
              <li>원자재 시세 정보 제공</li>
              <li>HACCP 관련 정보 제공</li>
              <li>커뮤니티 서비스</li>
              <li>견적 문의 및 A/S 접수</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제5조 (회원가입)
            </h2>
            <p className="text-muted-foreground">
              이용자는 회사가 정한 양식에 따라 회원정보를 기입한 후 본 약관에
              동의한다는 의사 표시를 함으로써 회원가입을 신청합니다. 회사는 전항에
              따른 신청에 대하여 승낙함으로써 회원가입이 완료됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제6조 (회원의 의무)
            </h2>
            <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
              <li>
                회원은 관계 법령, 본 약관의 규정, 이용안내 등 회사가 공지하는
                사항을 준수하여야 합니다.
              </li>
              <li>
                회원은 타인의 개인정보를 침해하거나 서비스의 운영을 방해하는
                행위를 하여서는 안 됩니다.
              </li>
              <li>
                회원은 서비스를 이용하여 얻은 정보를 회사의 사전 승인 없이
                상업적으로 이용하거나 제3자에게 제공할 수 없습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제7조 (서비스 이용의 제한)
            </h2>
            <p className="text-muted-foreground">
              회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을
              방해한 경우, 서비스 이용을 경고, 일시 정지, 영구 이용 정지 등으로
              제한할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제8조 (면책 조항)
            </h2>
            <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
              <li>
                회사는 천재지변, 전쟁, 기타 불가항력적인 사유로 서비스를 제공할 수
                없는 경우 책임이 면제됩니다.
              </li>
              <li>
                회사는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대하여
                책임지지 않습니다.
              </li>
              <li>
                회사는 이용자 간 또는 이용자와 제3자 간에 서비스를 매개로 발생한
                분쟁에 대해 관여할 의무가 없으며, 이에 따른 손해를 배상할 책임이
                없습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제9조 (준거법 및 관할)
            </h2>
            <p className="text-muted-foreground">
              본 약관의 해석 및 회사와 이용자 간의 분쟁에 관하여는 대한민국 법을
              적용하며, 분쟁 발생 시 회사의 본사 소재지를 관할하는 법원을
              전속관할로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              제10조 (기타)
            </h2>
            <p className="text-muted-foreground">
              본 약관에서 정하지 아니한 사항과 본 약관의 해석에 관하여는 관련 법령
              및 상관례에 따릅니다.
            </p>
          </section>

          <div className="mt-12 rounded-lg border border-border bg-muted/50 p-6">
            <p className="text-sm text-muted-foreground">
              본 약관은 플레이스홀더 샘플이며, 실제 법률 검토 후 교체될
              예정입니다. 문의 사항은{' '}
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
