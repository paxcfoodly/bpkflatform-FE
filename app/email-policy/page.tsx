import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '이메일무단수집거부 — BPK Hub',
  description:
    'BPK Hub 이메일무단수집거부 안내. 정보통신망법에 따라 이메일 주소의 무단 수집을 거부합니다.',
  openGraph: {
    title: '이메일무단수집거부 — BPK Hub',
    description: 'BPK Hub 이메일무단수집거부 안내.',
    type: 'website',
  },
};

export default function EmailPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <section>
        <h1 className="mb-8 text-3xl font-bold text-foreground">
          이메일무단수집거부
        </h1>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-8">
            <p className="text-lg font-medium text-foreground">
              본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의
              기술적 장치를 이용하여 무단으로 수집되는 것을 거부합니다.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              법적 근거
            </h2>
            <p className="text-muted-foreground">
              「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제50조의2
              (전자우편주소의 무단 수집행위 등 금지)에 의거하여, 누구든지 전자우편
              주소의 수집을 거부하는 의사가 명시된 인터넷 홈페이지에서 자동으로
              전자우편 주소를 수집하는 프로그램이나 그 밖의 기술적 장치를 이용하여
              전자우편 주소를 수집하여서는 안 됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              위반 시 처벌
            </h2>
            <p className="text-muted-foreground">
              이를 위반하여 전자우편 주소를 수집·판매·유통하거나 정보 전송에
              이용하는 자는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」
              제74조에 따라 1년 이하의 징역 또는 1천만 원 이하의 벌금에 처해질 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">
              수집 거부 대상
            </h2>
            <p className="text-muted-foreground">
              본 사이트(BPK Hub)에 게시된 모든 이메일 주소는 수집 거부 대상이며,
              이를 위반 시 관련 법률에 의해 처벌받을 수 있음을 유의하시기 바랍니다.
            </p>
          </section>

          <div className="mt-12 rounded-lg border border-border bg-muted/50 p-6">
            <p className="text-sm text-muted-foreground">
              이메일 수집 관련 문의 사항은{' '}
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
