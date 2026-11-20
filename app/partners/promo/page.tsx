import type { Metadata } from "next";
import { requireBrand } from "@/lib/partners/auth";
import { getBrand, listProducts, listPromoRequests } from "@/lib/partners/db";
import { PROMO_KIND_LABEL, PROMO_STATUS_LABEL, fmtDate } from "@/lib/partners/model";
import { Thumb } from "@/components/partners/ui";
import PTop, { PHead } from "../PTop";
import PromoForm, { CancelPromo } from "./PromoForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "추천·핫딜 신청" };

const md = (d: string | null) => (d ? `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}` : "");

// 브랜드가 제품을 '이번 주 추천' 또는 '핫딜'로 신청하는 화면
export default async function PromoRequestPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const s = await requireBrand();
  const sp = await searchParams;
  const [brand, products, requests] = await Promise.all([getBrand(s.brandId), listProducts({ brandId: s.brandId }), listPromoRequests({ brandId: s.brandId, limit: 100 })]);
  const live = products.filter((p) => p.status === "approved");
  const pmap = new Map(products.map((p) => [p.id, p]));
  const onNow = live.filter((p) => p.pick_week || p.hot_deal);
  const opts = live.map((p) => ({ id: p.id, label: `${p.serial ? `${p.serial} · ` : ""}${p.name}${p.to_visible === false ? " (TO 숨김)" : ""}`, pick: p.pick_week, hot: p.hot_deal }));

  return (
    <>
      <PTop s={s} current="promo" brandName={brand?.name_ko} />
      <main className="a-wrap">
        <PHead
          crumb="제품 관리"
          title="추천·핫딜 신청"
          desc="크리에이터용 TO 제품 리스트(to.vigtiger.com) 맨 위 '이번 주 추천'과 '핫딜' 묶음에 우리 제품을 올려 달라고 신청해요. 신청하면 담당자가 확인 후 진행하겠습니다."
        />
        {brand && !brand.active && (
          <p className="a-note" role="note">
            지금 우리 브랜드는 TO 서비스에 노출되지 않고 있어요. 추천·핫딜로 진행되어도 크리에이터에게 보이려면 <a href="/my/profile">브랜드 정보</a> 메뉴에서 노출 신청을 함께 해 주세요.
          </p>
        )}

        <PromoForm products={opts} initialProduct={opts.some((o) => o.id === sp.product) ? sp.product : undefined} />

        <section className="a-card a-sec" aria-labelledby="pr-now">
          <h2 id="pr-now">지금 올라 있는 우리 제품</h2>
          {onNow.length === 0 ? (
            <p className="a-sub">지금 이번 주 추천·핫딜에 올라 있는 제품이 없어요.</p>
          ) : (
            <ul className="pr-list">
              {onNow.map((p) => (
                <li key={p.id} className="pr-row">
                  <div className="p-prod pr-prod">
                    <Thumb src={p.image_url} size={40} />
                    <div>
                      <b>{p.name}</b>
                      <div className="a-sub">{p.serial}</div>
                    </div>
                  </div>
                  <div className="pr-acts">
                    {p.pick_week && <span className="pr-on">이번 주 추천</span>}
                    {p.hot_deal && (
                      <span className="pr-on is-hot">
                        핫딜{p.hot_note ? ` · ${p.hot_note}` : ""}
                        {p.hot_until ? ` · ~${md(p.hot_until)}` : ""}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card" aria-labelledby="pr-history">
          <h2 id="pr-history" className="pr-h2" style={{ padding: "16px 18px 0" }}>신청 내역</h2>
          <div className="a-table-box">
            <table className="a-table p-table">
              <thead>
                <tr>
                  <th scope="col">신청일</th>
                  <th scope="col">제품</th>
                  <th scope="col">종류</th>
                  <th scope="col">희망 기간 · 문구</th>
                  <th scope="col">상태</th>
                  <th scope="col"><span className="sr-only">작업</span></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const p = pmap.get(r.product_id);
                  return (
                    <tr key={r.id}>
                      <td className="a-nowrap a-sub">{fmtDate(r.created_at)}</td>
                      <td>{p ? p.name : <span className="a-sub">삭제된 제품</span>}</td>
                      <td className="a-nowrap">{PROMO_KIND_LABEL[r.kind]}</td>
                      <td>
                        {r.start_date || r.end_date ? `${md(r.start_date) || "바로"} ~ ${md(r.end_date) || "정하지 않음"}` : <span className="a-sub">기간 없음</span>}
                        {r.hot_note && <div className="a-sub">{r.hot_note}</div>}
                      </td>
                      <td>
                        <span className={`p-tag ${r.status === "pending" ? "is-edit" : r.status === "approved" ? "is-new" : r.status === "rejected" ? "is-del" : "is-off"}`}>{PROMO_STATUS_LABEL[r.status]}</span>
                        {r.status === "pending" && <div className="a-sub">담당자가 확인 후 진행하겠습니다.</div>}
                        {r.status === "rejected" && r.reject_reason && <div className="p-reason">{r.reject_reason}</div>}
                      </td>
                      <td className="a-nowrap">{r.status === "pending" && <CancelPromo id={r.id} />}</td>
                    </tr>
                  );
                })}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="a-empty">아직 신청한 내역이 없어요.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
