import { CATEGORY_LABEL, type PartnerBrand, type ToProduct } from "@/lib/partners/model";

// 제품 리스트 기본 화면 — 게시 중 제품을 게시물(카드) 형태로 보여 줍니다.
// 브랜드마다 묶어서, 브랜드 이름 → 제품 카드 순서. (인쇄용은 Catalog.tsx)
export default function ProductBoard({
  brands,
  products,
  productHref,
  showBrandHead = true,
}: {
  brands: PartnerBrand[];
  products: ToProduct[];
  /** 카드 제목을 누르면 갈 곳 (관리자: 제품 수정 화면) */
  productHref?: (p: ToProduct) => string;
  showBrandHead?: boolean;
}) {
  const byBrand = new Map<string, ToProduct[]>();
  for (const p of products) byBrand.set(p.brand_id, [...(byBrand.get(p.brand_id) ?? []), p]);
  const shown = brands.filter((b) => byBrand.has(b.id));
  if (shown.length === 0) return <p className="a-card a-empty">조건에 맞는 게시 중 제품이 없어요.</p>;

  return (
    <div className="pb-board">
      {shown.map((b) => (
        <section key={b.id} className="pb-brand" aria-label={b.name_ko}>
          {showBrandHead && (
            <header className="pb-brand-head">
              <h2>
                {b.name_ko} {b.name_en && <small>{b.name_en}</small>}
              </h2>
              <span className="a-sub">
                {CATEGORY_LABEL[b.category]} · 제품 {byBrand.get(b.id)!.length}개
              </span>
            </header>
          )}
          {b.notice && (
            <p className="pb-notice">
              <b>꼭 알아두세요</b> {b.notice.split("\n")[0]}
            </p>
          )}
          <ul className="pb-grid">
            {byBrand.get(b.id)!.map((p) => (
              <li key={p.id} className="pb-card">
                <div className="pb-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image_url ? <img src={p.image_url} alt="" loading="lazy" /> : <span>이미지 없음</span>}
                  {p.note && <span className="pb-note">{p.note}</span>}
                </div>
                <div className="pb-body">
                  <span className="pb-serial">{p.serial ?? "–"}{p.section ? ` · ${p.section}` : ""}</span>
                  <h3 className="pb-name">
                    {productHref ? <a href={productHref(p)}>{p.name}</a> : p.name}
                  </h3>
                  {p.feature && <p className="pb-feature">{p.feature}</p>}
                  <div className="pb-foot">
                    <span className={`pb-chip ${p.sponsor ? "is-on" : ""}`}>협찬 {p.sponsor ? "가능" : "불가"}</span>
                    <span className={`pb-chip ${p.rental ? "is-on" : ""}`}>대여 {p.rental ? "가능" : "불가"}</span>
                    {p.product_url && (
                      <a className="pb-link" href={p.product_url} target="_blank" rel="noopener noreferrer">보러가기 ↗</a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
