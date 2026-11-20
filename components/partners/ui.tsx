import { PRICE_KEYS, PRODUCT_FIELDS, STATUS_LABEL, discountPct, fieldText, type ProductDraft, type ProductStatus, type ToProduct } from "@/lib/partners/model";

const STATUS_STYLE: Record<ProductStatus, { bg: string; fg: string }> = {
  pending: { bg: "#fff1e6", fg: "#9a3412" },
  approved: { bg: "#e9f7ee", fg: "#11552a" },
  rejected: { bg: "#fde8e8", fg: "#9b1c1c" },
  hidden: { bg: "#eeeeee", fg: "#444444" },
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  const s = STATUS_STYLE[status];
  return <span className="a-badge" style={{ background: s.bg, color: s.fg }}>{STATUS_LABEL[status]}</span>;
}

/** 게시 중 제품에 걸린 요청 표시 */
export function RequestTags({ p }: { p: ToProduct }) {
  return (
    <>
      {p.pending_changes && <span className="p-tag is-edit">수정 요청 중</span>}
      {p.delete_requested && <span className="p-tag is-del">삭제 요청 중</span>}
    </>
  );
}

export function Thumb({ src, size = 56 }: { src: string | null | undefined; size?: number }) {
  return (
    <span className="p-thumb" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" loading="lazy" /> : null}
    </span>
  );
}

/** 출력물과 같은 모양의 제품 칸 */
export function CatalogCell({ p, serial }: { p: Pick<ProductDraft, "name" | "feature" | "sponsor" | "rental" | "product_url" | "image_url" | "note">; serial: string | null }) {
  return (
    <article className="c-cell">
      <header className="c-cell-head">
        <span className="c-label">제품명</span>
        <b className="c-name">{p.name}</b>
        {p.product_url ? (
          <a className="c-link" href={p.product_url} target="_blank" rel="noopener noreferrer">보러가기</a>
        ) : p.note ? (
          <span className="c-note">{p.note}</span>
        ) : null}
      </header>
      <div className="c-cell-body">
        <div className="c-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.image_url ? <img src={p.image_url} alt="" /> : null}
        </div>
        <div className="c-text">
          <p className="c-serial">티오 일련번호 : {serial ?? "승인 시 부여"}</p>
          {p.feature && <p className="c-feature">특징 : {p.feature}</p>}
          <div className="c-avail">
            <span className="c-k">협찬</span>
            <span className="c-v">{p.sponsor ? "가능" : "-"}</span>
            <span className="c-k">대여</span>
            <span className="c-v">{p.rental ? "가능" : "-"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/** 가격·판매 조건 요약 (관리자 승인 화면용) — 비어 있으면 안내 문구 */
export function PriceTerms({ d }: { d: ProductDraft }) {
  const rows = PRODUCT_FIELDS.filter((f) => PRICE_KEYS.includes(f.key) && d[f.key] !== null && d[f.key] !== "");
  if (rows.length === 0) return <p className="a-sub">가격·판매 조건: 입력 안 함</p>;
  return (
    <dl className="p-terms">
      {rows.map((f) => (
        <div key={f.key}>
          <dt>{f.label}</dt>
          <dd>
            {fieldText(f.key, d[f.key])}
            {f.key === "groupbuy_price" && discountPct(d.list_price, d.groupbuy_price) !== null && <small> (정가 대비 {discountPct(d.list_price, d.groupbuy_price)}%↓)</small>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
