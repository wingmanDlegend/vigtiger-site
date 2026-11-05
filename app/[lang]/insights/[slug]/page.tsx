import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ContactSection } from "@/components/Sections";
import { formatKoDate, getPublishedInsight, safeUrl, type InsightItem } from "@/lib/insights";

export const revalidate = 300;
// 글은 빌드 때 만들지 않고 첫 방문 때 만들어 5분간 캐시합니다.
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (lang !== "ko") return {};
  const p = await getPublishedInsight(slug);
  if (!p) return {};
  const description = (p.intro ?? "").slice(0, 150) || "오늘의 인플루언서 마케팅 소식 정리";
  return {
    title: `${p.title} — 인사이트`,
    description,
    alternates: { canonical: `/insights/${p.slug}` },
    openGraph: { title: p.title, description, type: "article", publishedTime: p.published_at ?? undefined },
  };
}

function ItemCard({ it }: { it: InsightItem }) {
  const href = safeUrl(it.url);
  return (
    <li className="insight-item">
      <p className="insight-item-meta">
        <span>{it.source}</span>
        {it.published && <time dateTime={it.published}>{it.published.replaceAll("-", ".")}</time>}
      </p>
      <h3>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer nofollow">
            {it.title}
            <span className="sr-only"> (새 창에서 원문 열기)</span>
            <span aria-hidden="true" className="insight-ext">↗</span>
          </a>
        ) : (
          it.title
        )}
      </h3>
      <p className="insight-item-summary">{it.summary}</p>
    </li>
  );
}

export default async function InsightPostPage({ params }: Props) {
  const { lang, slug } = await params;
  if (lang !== "ko") notFound();
  const p = await getPublishedInsight(slug);
  if (!p) notFound();
  const groups = (["국내", "해외"] as const)
    .map((region) => ({ region, items: p.items.filter((i) => i.region === region) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <Header lang="ko" />
      <main>
        <article className="insight-post">
          <header className="insight-post-head">
            <div className="container insight-narrow">
              <Link href="/insights" className="insight-back">
                ← 인사이트 목록
              </Link>
              <p className="hero-eyebrow">
                <time dateTime={p.post_date}>{formatKoDate(p.post_date)}</time>
              </p>
              <h1>{p.title}</h1>
              {p.intro && <p className="insight-intro">{p.intro}</p>}
            </div>
          </header>
          <div className="container insight-narrow insight-body">
            {groups.map((g) => (
              <section key={g.region} aria-labelledby={`g-${g.region}`}>
                <h2 id={`g-${g.region}`} className="insight-group">
                  {g.region} <small>{g.items.length}건</small>
                </h2>
                <ol className="insight-items">
                  {g.items.map((it, i) => (
                    <ItemCard it={it} key={`${it.url}-${i}`} />
                  ))}
                </ol>
              </section>
            ))}
            {p.takeaway && (
              <aside className="insight-takeaway">
                <h2>대범한사람들의 시선</h2>
                <p>{p.takeaway}</p>
              </aside>
            )}
            <p className="insight-note">
              각 기사의 저작권은 해당 언론사에 있으며, 이 글은 원문 내용을 요약해 소개한 것입니다. 자세한 내용은 원문 링크에서
              확인해 주세요.
            </p>
          </div>
        </article>
        <ContactSection lang="ko" />
      </main>
      <Footer lang="ko" />
    </>
  );
}
