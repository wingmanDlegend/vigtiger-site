import type { PubBrand, PubProduct } from "@/lib/tosite/data";

const md = (d: string) => {
  const [, m, day] = d.split("-");
  return `${Number(m)}/${Number(day)}`;
};

export const applyHref = (p: Pick<PubProduct, "id" | "brand_id">) => `/apply?brand=${p.brand_id}&product=${p.id}`;

// 크리에이터용 제품 카드 — 사진 · 브랜드 · 제품명 · 특징 · 협찬/대여 · 신청 버튼
export default function ProductCard({ p, brand, variant }: { p: PubProduct; brand?: PubBrand; variant?: "pick" | "hot" }) {
  return (
    <li className={`tp-card${variant ? ` is-${variant}` : ""}`}>
      <div className="tp-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.image_url ? <img src={p.image_url} alt="" loading="lazy" decoding="async" /> : <span className="tp-noimg">이미지 준비 중</span>}
        {variant === "pick" && <span className="tp-flag is-pick">이번 주 추천</span>}
        {variant === "hot" && <span className="tp-flag is-hot">{p.hot_note || "핫딜"}</span>}
        {!variant && p.note && <span className="tp-flag">{p.note}</span>}
      </div>
      <div className="tp-body">
        {brand && <span className="tp-brand">{brand.name_ko}</span>}
        <h3 className="tp-name">{p.name}</h3>
        {p.feature && <p className="tp-feature">{p.feature}</p>}
        <div className="tp-chips">
          {p.rental && <span className="tp-chip is-rental">대여 가능</span>}
          {p.sponsor && <span className="tp-chip is-sponsor">협찬 가능</span>}
          {variant === "hot" && p.hot_until && <span className="tp-chip is-until">~{md(p.hot_until)}까지</span>}
          {p.serial && <span className="tp-serial">{p.serial}</span>}
        </div>
        <div className="tp-actions">
          <a className="tp-apply" href={applyHref(p)} aria-label={`${p.name} 신청하기`}>
            신청하기
          </a>
          {p.product_url && (
            <a className="tp-more" href={p.product_url} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} 제품 페이지 (새 창)`}>
              제품 보기 ↗
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
