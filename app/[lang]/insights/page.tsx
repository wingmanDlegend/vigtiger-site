import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ContactSection, SubHero } from "@/components/Sections";
import { InsightTabs, PostList } from "@/components/Insights";
import { INSIGHT_KINDS, KIND_META, listPublishedInsights } from "@/lib/insights";

// 인사이트 첫 화면 — 업계 동향 / Hot Contents 최신 글 (한국어 전용)
export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

const META = {
  title: "인사이트 — 업계 동향 · Hot Contents",
  description: "인플루언서 마케팅 업계 동향과 어제의 화제 소셜 콘텐츠를 매일 정리합니다. 대범한사람들 인사이트.",
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

export default async function InsightsHome({ params }: Props) {
  const { lang } = await params;
  if (lang !== "ko") notFound();
  const lists = await Promise.all(INSIGHT_KINDS.map((k) => listPublishedInsights(k, 5)));

  return (
    <>
      <Header lang="ko" />
      <main>
        <SubHero
          eyebrow="INSIGHTS"
          title={["크리에이터 마케팅,", "매일 한눈에"]}
          lead="업계 동향에서는 국내외 인플루언서 마케팅 소식을, Hot Contents에서는 어제 화제가 된 소셜 콘텐츠와 활용 포인트를 매일 정리합니다."
        />
        <InsightTabs />
        {INSIGHT_KINDS.map((k, i) => {
          const m = KIND_META[k];
          const posts = lists[i];
          return (
            <section key={k} className={`section insights ${i % 2 ? "is-alt" : ""}`} aria-labelledby={`sec-${k}`}>
              <div className="container">
                <div className="insights-head">
                  <div>
                    <p className="eyebrow">{m.eyebrow}</p>
                    <h2 className="h2" id={`sec-${k}`}>
                      {m.label}
                    </h2>
                    <p className="insights-head-lead">{m.lead}</p>
                  </div>
                  <Link href={m.path} className="btn btn-outline">
                    전체 보기
                  </Link>
                </div>
                {posts.length === 0 ? (
                  <p className="insights-empty">첫 번째 {m.label} 글을 준비하고 있어요. 곧 찾아올게요.</p>
                ) : (
                  <PostList posts={posts} />
                )}
              </div>
            </section>
          );
        })}
        <ContactSection lang="ko" />
      </main>
      <Footer lang="ko" />
    </>
  );
}
