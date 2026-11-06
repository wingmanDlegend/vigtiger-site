import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ContactSection, SubHero } from "@/components/Sections";
import {
  INSIGHT_KINDS,
  KIND_META,
  formatKoDate,
  getPublishedInsight,
  listPublishedInsights,
  postPath,
  safeUrl,
  type InsightItem,
  type InsightKind,
  type InsightPost,
} from "@/lib/insights";

// 인사이트 공통 화면 (한국어 전용)

/** 인사이트 하위 메뉴 탭 */
export function InsightTabs({ current }: { current?: InsightKind }) {
  return (
    <nav className="insight-tabs" aria-label="인사이트 메뉴">
      <div className="container insight-tabs-in">
        <Link href="/insights" aria-current={!current ? "page" : undefined}>
          전체
        </Link>
        {INSIGHT_KINDS.map((k) => (
          <Link key={k} href={KIND_META[k].path} aria-current={current === k ? "page" : undefined}>
            {KIND_META[k].label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function countLine(p: InsightPost) {
  const kr = p.items.filter((i) => i.region === "국내").length;
  return `${KIND_META[p.kind].unit} ${p.items.length}건 · 국내 ${kr} · 해외 ${p.items.length - kr}`;
}

/** 글 목록 */
export function PostList({ posts, showKind = false }: { posts: InsightPost[]; showKind?: boolean }) {
  return (
    <ol className="insight-list">
      {posts.map((p) => (
        <li key={p.id}>
          <Link href={postPath(p)} className="insight-row">
            <time dateTime={p.post_date}>{formatKoDate(p.post_date)}</time>
            <span className="insight-row-main">
              {showKind && <span className={`insight-kind is-${p.kind}`}>{KIND_META[p.kind].label}</span>}
              <b>{p.title}</b>
              {p.intro && <span className="insight-row-intro">{p.intro}</span>}
            </span>
            <span className="insight-row-meta">{countLine(p)}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function kindMetadata(kind: InsightKind): Metadata {
  const m = KIND_META[kind];
  return {
    title: m.metaTitle,
    description: m.metaDesc,
    alternates: { canonical: m.path },
    openGraph: { title: m.metaTitle, description: m.metaDesc, type: "website" },
  };
}

/** 하위 메뉴 목록 페이지 */
export async function KindListPage({ lang, kind }: { lang: string; kind: InsightKind }) {
  if (lang !== "ko") notFound();
  const m = KIND_META[kind];
  const posts = await listPublishedInsights(kind);
  return (
    <>
      <Header lang="ko" />
      <main>
        <SubHero eyebrow={m.eyebrow} title={m.title} lead={m.lead} />
        <InsightTabs current={kind} />
        <section className="section insights">
          <div className="container">
            {posts.length === 0 ? (
              <p className="insights-empty">첫 번째 {m.label} 글을 준비하고 있어요. 곧 찾아올게요.</p>
            ) : (
              <PostList posts={posts} />
            )}
          </div>
        </section>
        <ContactSection lang="ko" />
      </main>
      <Footer lang="ko" />
    </>
  );
}

export async function postMetadata(kind: InsightKind, lang: string, slug: string): Promise<Metadata> {
  if (lang !== "ko") return {};
  const p = await getPublishedInsight(kind, slug);
  if (!p) return {};
  const description = (p.intro ?? "").slice(0, 150) || KIND_META[kind].metaDesc;
  return {
    title: `${p.title} — ${KIND_META[kind].label}`,
    description,
    alternates: { canonical: postPath(p) },
    openGraph: { title: p.title, description, type: "article", publishedTime: p.published_at ?? undefined },
  };
}

function ExtLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow">
      {children}
      <span className="sr-only"> (새 창에서 열기)</span>
      <span aria-hidden="true" className="insight-ext">
        ↗
      </span>
    </a>
  );
}

function TrendItem({ it }: { it: InsightItem }) {
  return (
    <li className="insight-item">
      <p className="insight-item-meta">
        <span>{it.source}</span>
        {it.published && <time dateTime={it.published}>{it.published.replaceAll("-", ".")}</time>}
      </p>
      <h3>
        <ExtLink href={safeUrl(it.url)}>{it.title}</ExtLink>
      </h3>
      <p className="insight-item-summary">{it.summary}</p>
    </li>
  );
}

const PLATFORM_CLASS: Record<string, string> = {
  youtube: "is-yt",
  instagram: "is-ig",
  tiktok: "is-tt",
  x: "is-x",
};

function HotItem({ it, rank }: { it: InsightItem; rank: number }) {
  const href = safeUrl(it.url);
  const article = it.articleUrl ? safeUrl(it.articleUrl) : null;
  const pcls = PLATFORM_CLASS[(it.platform ?? "").toLowerCase()] ?? "";
  return (
    <li className="hot-item">
      <span className="hot-rank" aria-hidden="true">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="hot-body">
        <p className="hot-meta">
          {it.platform && <span className={`hot-platform ${pcls}`}>{it.platform}</span>}
          {it.creator && <span className="hot-creator">{it.creator}</span>}
          {it.published && <time dateTime={it.published}>{it.published.replaceAll("-", ".")}</time>}
        </p>
        <h3>
          <ExtLink href={href}>{it.title}</ExtLink>
        </h3>
        {it.metric && <p className="hot-metric">{it.metric}</p>}
        <dl className="hot-dl">
          <div>
            <dt>왜 떴나</dt>
            <dd>{it.summary}</dd>
          </div>
          {it.point && (
            <div>
              <dt>활용 포인트</dt>
              <dd>{it.point}</dd>
            </div>
          )}
        </dl>
        <p className="hot-source">
          출처 · {it.source}
          {article && (
            <>
              {" "}
              ·{" "}
              <a href={article} target="_blank" rel="noopener noreferrer nofollow">
                관련 기사<span className="sr-only"> (새 창에서 열기)</span>
              </a>
            </>
          )}
        </p>
      </div>
    </li>
  );
}

/** 글 상세 페이지 */
export async function PostPage({ lang, kind, slug }: { lang: string; kind: InsightKind; slug: string }) {
  if (lang !== "ko") notFound();
  const p = await getPublishedInsight(kind, slug);
  if (!p) notFound();
  const m = KIND_META[kind];
  const groups = (["국내", "해외"] as const)
    .map((region) => ({ region, items: p.items.filter((i) => i.region === region) }))
    .filter((g) => g.items.length > 0);
  let rank = 0;

  return (
    <>
      <Header lang="ko" />
      <main>
        <article className="insight-post">
          <header className={`insight-post-head ${kind === "hot" ? "is-hot" : ""}`}>
            <div className="container insight-narrow">
              <Link href={m.path} className="insight-back">
                ← {m.label} 목록
              </Link>
              <p className="hero-eyebrow">
                {m.label} · <time dateTime={p.post_date}>{formatKoDate(p.post_date)}</time>
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
                <ol className={kind === "hot" ? "hot-items" : "insight-items"}>
                  {g.items.map((it, i) =>
                    kind === "hot" ? <HotItem it={it} rank={++rank} key={`${it.url}-${i}`} /> : <TrendItem it={it} key={`${it.url}-${i}`} />,
                  )}
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
              {kind === "hot"
                ? "각 콘텐츠의 저작권은 원작자에게 있으며, 이 글은 콘텐츠를 소개하고 링크로 연결한 것입니다. 조회수 등 수치는 작성 시점에 확인한 값으로 이후 달라질 수 있습니다."
                : "각 기사의 저작권은 해당 언론사에 있으며, 이 글은 원문 내용을 요약해 소개한 것입니다. 자세한 내용은 원문 링크에서 확인해 주세요."}
            </p>
          </div>
        </article>
        <ContactSection lang="ko" />
      </main>
      <Footer lang="ko" />
    </>
  );
}

/** 홈 — Today's Issue: 업계 동향·Hot Contents 가장 최근 게시 글 (한국어 전용) */
export async function TodayIssue() {
  const latest = (await Promise.all(INSIGHT_KINDS.map((k) => listPublishedInsights(k, 1)))).map((l) => l[0]).filter(Boolean);
  if (latest.length === 0) return null;

  return (
    <section className="today" aria-labelledby="today-title">
      <div className="container section-tight today-in">
        <div className="today-head">
          <div>
            <p className="eyebrow">TODAY&apos;S ISSUE</p>
            <h2 className="h2" id="today-title">
              오늘의 크리에이터 마케팅 이슈
            </h2>
          </div>
          <Link href="/insights" className="link-arrow">
            인사이트 전체 보기 →
          </Link>
        </div>
        <div className="today-cards">
          {latest.map((p) => {
            const m = KIND_META[p.kind];
            return (
              <article key={p.id} className={`today-card is-${p.kind}`}>
                <p className="today-meta">
                  <span className={`insight-kind is-${p.kind}`}>{m.label}</span>
                  <time dateTime={p.post_date}>{formatKoDate(p.post_date)}</time>
                </p>
                <h3>
                  <Link href={postPath(p)}>{p.title}</Link>
                </h3>
                {p.intro && <p className="today-intro">{p.intro}</p>}
                <ul className="today-items">
                  {p.items.slice(0, 3).map((it, i) => (
                    <li key={`${it.url}-${i}`}>
                      <span>{p.kind === "hot" ? it.platform || it.source : it.source}</span>
                      {it.title}
                    </li>
                  ))}
                </ul>
                <Link href={postPath(p)} className="today-more" aria-label={`${m.label} ${p.title} 전체 읽기`}>
                  {m.unit} {p.items.length}건 전체 읽기 →
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
