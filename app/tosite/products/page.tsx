import type { Metadata } from "next";
import { ToCta, ToFooter, ToHeader } from "@/components/tosite/Chrome";
import WishBar from "@/components/tosite/WishBar";
import ProductCard from "@/components/tosite/ProductCard";
import { CATEGORIES, CATEGORY_LABEL, type CategoryKey } from "@/lib/partners/model";
import { getToCatalog, type PubProduct } from "@/lib/tosite/data";

export const metadata: Metadata = {
  title: "TO 제품 리스트",
  description: "티오(TO)로 무료 대여·협찬 받을 수 있는 제품 — 이번 주 추천 제품, 핫딜 제품, 분류별 전체 제품을 보고 바로 신청하세요.",
  alternates: { canonical: "/products" },
};

type SP = Promise<{ category?: string; q?: string }>;

export default async function ToProducts({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const category = CATEGORIES.find((c) => c.key === sp.category)?.key as CategoryKey | undefined;
  const q = (sp.q ?? "").trim().slice(0, 40);

  let data: Awaited<ReturnType<typeof getToCatalog>> | null = null;
  try {
    data = await getToCatalog();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <>
        <ToHeader current="products" />
        <main className="container section">
          <h1 className="h2">TO 제품 리스트</h1>
          <p className="lead" style={{ marginTop: 16 }}>
            제품 리스트를 잠시 불러오지 못했어요. 잠시 뒤 다시 열어 주세요. 급하시면 <a href="/apply">상담신청</a>으로 남겨 주셔도 돼요.
          </p>
        </main>
        <ToFooter />
      </>
    );
  }

  const { brands, products, brandById, picks, hots } = data;
  const catOf = (p: PubProduct) => brandById.get(p.brand_id)!.category;
  const countBy = (c: CategoryKey) => products.filter((p) => catOf(p) === c).length;
  const needle = q.toLowerCase();
  const shown = products.filter(
    (p) =>
      (!category || catOf(p) === category) &&
      (!needle || [p.name, p.feature ?? "", p.serial ?? "", p.section ?? "", brandById.get(p.brand_id)!.name_ko, brandById.get(p.brand_id)!.name_en ?? ""].some((s) => s.toLowerCase().includes(needle))),
  );
  // 분류 → 브랜드 → 제품 순서로 묶기
  const groups = CATEGORIES.map((c) => ({
    cat: c,
    brands: brands
      .filter((b) => b.category === c.key)
      .map((b) => ({ b, items: shown.filter((p) => p.brand_id === b.id) }))
      .filter((g) => g.items.length > 0),
  })).filter((g) => g.brands.length > 0);
  const tabHref = (c?: string) => {
    const p = new URLSearchParams();
    if (c) p.set("category", c);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/products${s ? `?${s}` : ""}#all`;
  };
  const brandCount = new Set(products.map((p) => p.brand_id)).size;

  return (
    <>
      <ToHeader current="products" />
      <main>
        <section className="to-page-head">
          <div className="container">
            <p className="hero-eyebrow">TO PRODUCTS</p>
            <h1>TO 제품 리스트</h1>
            <p className="hero-body">
              브랜드 {brandCount}곳의 제품 {products.length}개를 무료로 써볼 수 있어요. 마음에 드는 제품의 <b>신청하기</b>를 누르면 상담신청서에 바로 담겨요.
            </p>
            <nav className="to-jump" aria-label="바로 가기">
              {picks.length > 0 && <a href="#picks">이번 주 추천 <small>{picks.length}</small></a>}
              {hots.length > 0 && <a href="#hot">핫딜 <small>{hots.length}</small></a>}
              <a href="#all">전체 제품 <small>{products.length}</small></a>
            </nav>
          </div>
        </section>

        {picks.length > 0 && (
          <section id="picks" className="container to-block" aria-labelledby="picks-title">
            <div className="to-block-head">
              <p className="eyebrow">THIS WEEK</p>
              <h2 className="h2" id="picks-title">이번 주 추천 제품</h2>
              <p className="lead">대범한사람들 MD가 이번 주에 고른 제품이에요.</p>
            </div>
            <ul className="tp-grid">
              {picks.map((p) => (
                <ProductCard key={p.id} p={p} brand={brandById.get(p.brand_id)} variant="pick" />
              ))}
            </ul>
          </section>
        )}

        {hots.length > 0 && (
          <section id="hot" className="to-hot" aria-labelledby="hot-title">
            <div className="container to-block">
              <div className="to-block-head">
                <p className="eyebrow">HOT DEAL</p>
                <h2 className="h2" id="hot-title">핫딜 제품</h2>
                <p className="lead">지금 조건이 특히 좋은 제품이에요. 기간이 정해진 제품은 마감일까지만 보여요.</p>
              </div>
              <ul className="tp-grid">
                {hots.map((p) => (
                  <ProductCard key={p.id} p={p} brand={brandById.get(p.brand_id)} variant="hot" />
                ))}
              </ul>
            </div>
          </section>
        )}

        <section id="all" className="container to-block" aria-labelledby="all-title">
          <div className="to-block-head">
            <p className="eyebrow">ALL PRODUCTS</p>
            <h2 className="h2" id="all-title">전체 제품</h2>
          </div>
          <div className="to-filter">
            <nav className="to-tabs" aria-label="분류">
              <a href={tabHref()} aria-current={!category ? "page" : undefined}>
                전체 <small>{products.length}</small>
              </a>
              {CATEGORIES.map((c) => (
                <a key={c.key} href={tabHref(c.key)} aria-current={category === c.key ? "page" : undefined}>
                  {c.label} <small>{countBy(c.key)}</small>
                </a>
              ))}
            </nav>
            <form className="to-search" action="/products#all" method="get" role="search">
              {category && <input type="hidden" name="category" value={category} />}
              <label className="sr-only" htmlFor="to-q">제품·브랜드 검색</label>
              <input id="to-q" name="q" className="input" defaultValue={q} placeholder="제품·브랜드 검색" maxLength={40} />
              <button className="btn btn-dark" type="submit">
                검색
              </button>
            </form>
          </div>
          {(q || category) && (
            <p className="to-result">
              {category ? `${CATEGORY_LABEL[category]} · ` : ""}
              {q ? `‘${q}’ 검색 · ` : ""}제품 {shown.length}개
              {" · "}
              <a href="/products#all">조건 지우기</a>
            </p>
          )}

          {groups.length === 0 ? (
            <p className="to-empty">조건에 맞는 제품이 없어요. 다른 분류를 보거나 검색어를 바꿔 보세요.</p>
          ) : (
            groups.map((g) => (
              <section key={g.cat.key} className="to-cat" aria-labelledby={`cat-${g.cat.key}`}>
                <h3 className="to-cat-title" id={`cat-${g.cat.key}`}>
                  <span>{g.cat.no}</span>
                  {g.cat.label}
                </h3>
                {g.brands.map(({ b, items }) => (
                  <div key={b.id} className="to-brand">
                    <div className="to-brand-head">
                      <h4>
                        {b.name_ko}
                        {b.name_en && <small>{b.name_en}</small>}
                      </h4>
                      {b.highlights?.length > 0 && (
                        <ul className="to-brand-hl">
                          {b.highlights.slice(0, 3).map((h) => (
                            <li key={h.title}>
                              <b>{h.title}</b>
                              {h.sub && <span>{h.sub}</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {b.notice && (
                      <p className="to-brand-notice">
                        <b>꼭 알아두세요</b> {b.notice.split("\n")[0]}
                      </p>
                    )}
                    <ul className="tp-grid">
                      {items.map((p) => (
                        <ProductCard key={p.id} p={p} />
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))
          )}
        </section>

        <ToCta />
      </main>
      <WishBar />
      <ToFooter />
    </>
  );
}
