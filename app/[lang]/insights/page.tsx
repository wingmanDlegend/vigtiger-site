import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ContactSection, SubHero } from "@/components/Sections";
import { formatKoDate, listPublishedInsights } from "@/lib/insights";

// 한국어 전용 메뉴입니다. (/insights)
export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

const META = {
  title: "인사이트 — 오늘의 인플루언서 마케팅",
  description: "국내외 인플루언서·크리에이터 마케팅 소식을 매일 골라 핵심만 정리합니다. 대범한사람들 인사이트.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "ko") return {};
  return {
    title: META.title,
    description: META.description,
    alternates: { canonical: "/insights" },
    openGraph: { title: META.title, description: META.description, type: "website" },
  };
}

export default async function InsightsPage({ params }: Props) {
  const { lang } = await params;
  if (lang !== "ko") notFound();
  const posts = await listPublishedInsights();

  return (
    <>
      <Header lang="ko" />
      <main>
        <SubHero
          eyebrow="INSIGHTS"
          title={["인플루언서 마케팅,", "오늘의 흐름"]}
          lead="국내외 인플루언서·크리에이터 마케팅 소식을 매일 골라 핵심만 정리합니다. 원문은 각 기사 링크에서 확인하세요."
        />
        <section className="section insights">
          <div className="container">
            {posts.length === 0 ? (
              <p className="insights-empty">첫 번째 인사이트를 준비하고 있어요. 곧 찾아올게요.</p>
            ) : (
              <ol className="insight-list">
                {posts.map((p) => {
                  const kr = p.items.filter((i) => i.region === "국내").length;
                  return (
                    <li key={p.id}>
                      <Link href={`/insights/${p.slug}`} className="insight-row">
                        <time dateTime={p.post_date}>{formatKoDate(p.post_date)}</time>
                        <span className="insight-row-main">
                          <b>{p.title}</b>
                          {p.intro && <span className="insight-row-intro">{p.intro}</span>}
                        </span>
                        <span className="insight-row-meta">
                          기사 {p.items.length}건 · 국내 {kr} · 해외 {p.items.length - kr}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
        <ContactSection lang="ko" />
      </main>
      <Footer lang="ko" />
    </>
  );
}
