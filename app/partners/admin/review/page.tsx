import type { Metadata } from "next";
import { requireSession } from "@/lib/partners/auth";
import { listBrandChangeRequests, listBrands, listReviewQueue } from "@/lib/partners/db";
import { BRAND_FIELDS, PRODUCT_FIELDS, brandToProfile, fmtDate, productToDraft, type BrandProfile, type ProductDraft } from "@/lib/partners/model";
import PTop, { PHead } from "../../PTop";
import { CatalogCell } from "../../ui";
import ReviewActions from "./ReviewActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "승인 대기" };

function show(v: unknown) {
  if (typeof v === "boolean") return v ? "가능" : "-";
  if (v === null || v === undefined || v === "") return <span className="a-sub">(비어 있음)</span>;
  return String(v);
}
function Value({ k, v }: { k: string; v: unknown }) {
  if ((k === "image_url" || k === "hero_url") && typeof v === "string" && v) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="p-diff-img" src={v} alt="" />;
  }
  if (k === "product_url" && typeof v === "string" && v) {
    return <a href={v} target="_blank" rel="noopener noreferrer" className="p-break">{v}</a>;
  }
  if (k === "highlights" && Array.isArray(v)) {
    return (
      <ul className="p-hl-list">
        {(v as BrandProfile["highlights"]).map((h, i) => (
          <li key={i}><b>{h.title}</b> — {h.sub}</li>
        ))}
      </ul>
    );
  }
  return <span className="p-pre">{show(v)}</span>;
}

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const s = await requireSession({ role: "admin" });
  const done = (await searchParams).done?.slice(0, 200);
  const [queue, brandReq, brands] = await Promise.all([listReviewQueue(), listBrandChangeRequests(), listBrands()]);
  const bmap = new Map(brands.map((b) => [b.id, b]));
  const kind = (p: (typeof queue)[number]) => (p.delete_requested ? "delete" : p.status === "pending" ? "new" : "edit");
  const KIND = { new: { label: "새 제품", cls: "is-new" }, edit: { label: "수정 요청", cls: "is-edit" }, delete: { label: "삭제 요청", cls: "is-del" } } as const;

  return (
    <>
      <PTop s={s} current="a-review" />
      <main className="a-wrap">
        <PHead
          crumb="제품 관리"
          title="승인 대기"
          desc="오래된 요청부터 보여요. 승인하면 바로 제품 리스트에 반영되고, 반려하면 사유가 브랜드 담당자 화면에 보여요."
        />
        {done && <p className="a-saved" role="status">{done}</p>}
        {queue.length + brandReq.length === 0 && <section className="a-card a-sec"><p className="a-empty">처리할 요청이 없어요. 👍</p></section>}

        {queue.map((p) => {
          const k = kind(p);
          const b = bmap.get(p.brand_id);
          const before = productToDraft(p);
          const after = { ...before, ...(p.pending_changes ?? {}) } as ProductDraft;
          const keys = PRODUCT_FIELDS.filter((f) => p.pending_changes && f.key in p.pending_changes);
          return (
            <section key={p.id} className="a-card a-sec p-req" aria-label={`${KIND[k].label} ${p.name}`}>
              <div className="p-req-head">
                <span className={`p-tag ${KIND[k].cls}`}>{KIND[k].label}</span>
                <b>{b?.name_ko ?? "?"}</b>
                <span className="a-sub">{p.serial ?? "일련번호 승인 시 부여"}</span>
                <span className="a-sub">· 요청 {fmtDate(p.change_requested_at ?? p.created_at)}</span>
                <a className="a-sub p-push" href={`/admin/products/${p.id}`}>직접 고치기 →</a>
              </div>
              {k === "edit" ? (
                <div className="a-table-box">
                  <table className="a-table p-diff">
                    <thead>
                      <tr>
                        <th scope="col">항목</th>
                        <th scope="col">지금</th>
                        <th scope="col">바꿀 내용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((f) => (
                        <tr key={f.key}>
                          <th scope="row">{f.label}</th>
                          <td><Value k={f.key} v={before[f.key]} /></td>
                          <td className="is-after"><Value k={f.key} v={after[f.key]} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="c-preview">
                  <CatalogCell p={before} serial={p.serial} />
                  {p.section && <p className="a-sub">분류: {p.section}</p>}
                </div>
              )}
              <ReviewActions id={p.id} target="product" approveLabel={k === "delete" ? "삭제 승인" : "승인"} />
            </section>
          );
        })}

        {brandReq.map((b) => {
          const before = brandToProfile(b);
          const ch = b.pending_changes ?? {};
          const keys = BRAND_FIELDS.filter((f) => f.key in ch);
          return (
            <section key={b.id} className="a-card a-sec p-req" aria-label={`브랜드 정보 수정 ${b.name_ko}`}>
              <div className="p-req-head">
                <span className="p-tag is-brand">브랜드 정보</span>
                <b>{b.name_ko}</b>
                <span className="a-sub">· 요청 {fmtDate(b.change_requested_at)}</span>
                <a className="a-sub p-push" href={`/admin/brands/${b.id}`}>직접 고치기 →</a>
              </div>
              <div className="a-table-box">
                <table className="a-table p-diff">
                  <thead>
                    <tr>
                      <th scope="col">항목</th>
                      <th scope="col">지금</th>
                      <th scope="col">바꿀 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((f) => (
                      <tr key={f.key}>
                        <th scope="row">{f.label}</th>
                        <td><Value k={f.key} v={before[f.key]} /></td>
                        <td className="is-after"><Value k={f.key} v={(ch as Record<string, unknown>)[f.key]} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ReviewActions id={b.id} target="brand" approveLabel="승인" />
            </section>
          );
        })}
      </main>
    </>
  );
}
