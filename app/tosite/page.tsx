import { ToCta, ToFooter, ToHeader } from "@/components/tosite/Chrome";
import ProductCard from "@/components/tosite/ProductCard";
import { ArrowRight } from "@/components/Icons";
import { Steps, SubHero } from "@/components/Sections";
import { getDict } from "@/lib/dictionary";
import { getPages } from "@/lib/pages";
import { CATEGORIES } from "@/lib/partners/model";
import { getToCatalog } from "@/lib/tosite/data";

// to.vigtiger.com 첫 화면 — TO 서비스 소개
// 제품 수·추천 제품은 캐시된 데이터(5분, 관리자 변경 시 즉시 갱신)로 매 요청 그려요.
export const dynamic = "force-dynamic";

export default async function ToIntro() {
  const p = getPages("ko").to;
  const steps = getDict("ko").services.to.steps;
  let data: Awaited<ReturnType<typeof getToCatalog>> | null = null;
  try {
    data = await getToCatalog();
  } catch {
    data = null; // 제품 수를 못 읽어도 소개 화면은 보여 줍니다.
  }
  const teaser = data ? (data.picks.length ? data.picks : data.hots).slice(0, 4) : [];

  return (
    <>
      <ToHeader current="intro" />
      <main>
        <SubHero
          eyebrow="TO (TRY-OUT) · 크리에이터 무료 제품 대여"
          title={p.title}
          lead={p.lead}
          aside={
            <div className="subhero-aside to-badge">
              <span className="to-word" aria-hidden="true">
                <b>T</b>ry-<b>O</b>ut
              </span>
              <p>{p.nameNote}</p>
              {data && (
                <dl className="to-live">
                  <div>
                    <dt>참여 브랜드</dt>
                    <dd>
                      {data.brands.filter((b) => data!.products.some((x) => x.brand_id === b.id)).length}
                      <small>곳</small>
                    </dd>
                  </div>
                  <div>
                    <dt>신청 가능한 제품</dt>
                    <dd>
                      {data.products.length}
                      <small>개</small>
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          }
        >
          <div className="hero-ctas">
            <a className="btn btn-accent" href="/products">
              TO 제품 리스트 보기
              <ArrowRight size={18} />
            </a>
            <a className="btn btn-outline" href="/apply">
              상담신청
            </a>
          </div>
        </SubHero>

        {teaser.length > 0 && (
          <section className="container section stack-48" aria-labelledby="teaser-title">
            <div className="to-section-head">
              <div className="section-head">
                <p className="eyebrow">{data!.picks.length ? "THIS WEEK" : "HOT DEAL"}</p>
                <h2 className="h2" id="teaser-title">
                  {data!.picks.length ? "이번 주 추천 제품" : "지금 핫딜 제품"}
                </h2>
              </div>
              <a className="link-arrow" href={data!.picks.length ? "/products#picks" : "/products#hot"}>
                전체 보기
                <ArrowRight />
              </a>
            </div>
            <ul className="tp-grid">
              {teaser.map((x) => (
                <ProductCard key={x.id} p={x} brand={data!.brandById.get(x.brand_id)} variant={data!.picks.length ? "pick" : "hot"} />
              ))}
            </ul>
          </section>
        )}

        <section className="services">
          <div className="container section">
            <div className="split">
              <div className="split-main section-head">
                <p className="eyebrow">{p.why.eyebrow}</p>
                <h2 className="h2">{p.why.title}</h2>
                {p.why.body.map((para) => (
                  <p className="lead" key={para}>
                    {para}
                  </p>
                ))}
              </div>
              <dl className="big-stats is-stacked">
                <div>
                  <dt>{p.why.stat.label}</dt>
                  <dd>{p.why.stat.value}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="container section stack-48">
          <div className="section-head">
            <p className="eyebrow">{p.pillars.eyebrow}</p>
            <h2 className="h2">{p.pillars.title}</h2>
          </div>
          <ol className="pillars">
            {p.pillars.items.map((it, i) => (
              <li key={it}>
                <span className="flow-num">{i + 1}</span>
                <b>{it}</b>
              </li>
            ))}
          </ol>
          <p className="lead" style={{ fontWeight: 700, color: "#111111" }}>
            {p.pillars.note}
          </p>
        </section>

        <section className="services">
          <div className="container section stack-48">
            <div className="section-head">
              <p className="eyebrow">{p.diff.eyebrow}</p>
              <h2 className="h2">{p.diff.title}</h2>
            </div>
            <div className="cards">
              {p.diff.items.map((it) => (
                <article className="card is-white" key={it.title}>
                  <h3>{it.title}</h3>
                  <p className="service-body">{it.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container section">
          <div className="split">
            <div className="split-main section-head">
              <p className="eyebrow">CATEGORIES</p>
              <h2 className="h2">이런 제품을 써볼 수 있어요</h2>
              <p className="lead">시장조사로 고른 브랜드의 제품을 분류별로 모아 두었어요. 관심 있는 분류를 눌러 바로 확인해 보세요.</p>
              <ul className="to-cats">
                {CATEGORIES.map((c) => {
                  const n = data ? data.products.filter((x) => data!.brandById.get(x.brand_id)?.category === c.key).length : null;
                  return (
                    <li key={c.key}>
                      <a href={`/products?category=${c.key}#all`}>
                        {c.label}
                        {n !== null && <small>{n}</small>}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="split-side">
              <h2 className="h3" style={{ marginBottom: 8 }}>
                {p.stepsTitle}
              </h2>
              <Steps steps={steps} />
              <a className="btn btn-dark" href="/apply" style={{ marginTop: 20 }}>
                상담신청
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>

        <ToCta />
      </main>
      <ToFooter />
    </>
  );
}
