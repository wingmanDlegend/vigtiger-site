import type { Metadata } from "next";
import { requireAdmin } from "@/lib/partners/auth";
import { listBrands, listProducts } from "@/lib/partners/db";
import type { PartnerBrand, ToProduct } from "@/lib/partners/model";
import { todayKst } from "@/lib/tosite/data";
import AdminTop from "@/app/admin/AdminTop";
import { PageHead as PHead } from "@/app/admin/SubNav";
import { Thumb } from "@/components/partners/ui";
import { promoAddAction, promoClearAction, promoMoveAction, promoRemoveAction, promoSaveHotAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "추천·핫딜" };

type SP = Promise<{ q?: string; saved?: string; error?: string }>;

// to.vigtiger.com 'TO 제품 리스트' 맨 위 두 묶음(이번 주 추천 / 핫딜)의 노출을 관리합니다.
export default async function PromoPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const [brands, all] = await Promise.all([listBrands(), listProducts()]);
  const bmap = new Map(brands.map((b) => [b.id, b]));
  const picks = all.filter((p) => p.pick_week).sort((a, b) => a.pick_sort - b.pick_sort);
  const hots = all.filter((p) => p.hot_deal).sort((a, b) => a.hot_sort - b.hot_sort);
  const today = todayKst();
  const needle = q.toLowerCase();
  const found = needle
    ? all
        .filter((p) => p.status === "approved")
        .filter((p) => [p.name, p.serial ?? "", p.feature ?? "", bmap.get(p.brand_id)?.name_ko ?? ""].some((x) => x.toLowerCase().includes(needle)))
        .slice(0, 40)
    : [];

  /** 사이트에 실제로 보이는지 + 안 보이면 이유 */
  const why = (p: ToProduct, hot = false): string | null => {
    const b = bmap.get(p.brand_id);
    if (p.status !== "approved") return "게시 중이 아니라 사이트에 안 보여요";
    if (!b?.active) return "브랜드가 리스트 비노출이라 안 보여요";
    if (hot && p.hot_until && p.hot_until < today) return "마감일이 지나 자동으로 내려갔어요";
    return null;
  };

  return (
    <>
      <AdminTop current="to-promo" />
      <main className="a-wrap">
        <PHead
          crumb="티오 파트너스"
          title="추천·핫딜"
          desc={
            <>
              크리에이터용 사이트 <a href="https://to.vigtiger.com/products" target="_blank" rel="noopener noreferrer">to.vigtiger.com</a>의 &lsquo;TO 제품 리스트&rsquo; 맨 위에 보일 제품을 고릅니다. 저장하면 사이트에 바로 반영돼요. 게시 중인 제품만 올릴 수 있어요.
            </>
          }
          actions={
            <a className="a-btn is-ghost" href="https://to.vigtiger.com/products" target="_blank" rel="noopener noreferrer">
              사이트에서 보기 ↗
            </a>
          }
        />
        {sp.saved && <p className="a-saved" role="status">{sp.saved.slice(0, 120)}</p>}
        {sp.error && <p className="a-error" role="alert">{sp.error.slice(0, 120)}</p>}

        <section className="a-card pr-add" aria-labelledby="pr-add-title">
          <h2 id="pr-add-title" className="pr-h2">제품 찾아서 올리기</h2>
          <form className="a-filter" method="get" action="/to/promo">
            <input className="a-input" type="search" name="q" defaultValue={q} placeholder="제품명·브랜드·일련번호" aria-label="제품 검색" />
            <button className="a-btn" type="submit">찾기</button>
            {q && <a className="a-sub" href="/to/promo">지우기</a>}
          </form>
          {q && (
            <ul className="pr-list">
              {found.length === 0 && <li className="a-sub">&lsquo;{q}&rsquo;에 맞는 게시 중 제품이 없어요.</li>}
              {found.map((p) => (
                <li key={p.id} className="pr-row">
                  <ProdCell p={p} b={bmap.get(p.brand_id)} />
                  <div className="pr-acts">
                    {p.pick_week ? (
                      <span className="pr-on">이번 주 추천 중</span>
                    ) : (
                      <form action={promoAddAction}>
                        <Hidden id={p.id} kind="pick" q={q} />
                        <button className="a-btn is-ghost p-sm" type="submit">+ 이번 주 추천</button>
                      </form>
                    )}
                    {p.hot_deal ? (
                      <span className="pr-on is-hot">핫딜 중</span>
                    ) : (
                      <form action={promoAddAction}>
                        <Hidden id={p.id} kind="hot" q={q} />
                        <button className="a-btn is-ghost p-sm" type="submit">+ 핫딜</button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="pr-cols">
          <section className="a-card" aria-labelledby="pr-pick-title">
            <div className="pr-head">
              <h2 id="pr-pick-title" className="pr-h2">
                이번 주 추천 <b>{picks.length}</b>
              </h2>
              {picks.length > 0 && <ClearAll kind="pick" label="이번 주 추천" q={q} />}
            </div>
            <p className="a-sub">위에서부터 순서대로 보여요. 매주 바꿀 때는 &lsquo;모두 내리기&rsquo; 후 새로 올리면 편해요.</p>
            <ol className="pr-list">
              {picks.length === 0 && <li className="a-empty">아직 없어요. 위에서 제품을 찾아 올려 주세요. (없으면 사이트에서 이 묶음은 숨겨져요)</li>}
              {picks.map((p, i) => (
                <li key={p.id} className="pr-row">
                  <ProdCell p={p} b={bmap.get(p.brand_id)} warn={why(p)} />
                  <div className="pr-acts">
                    <Move id={p.id} kind="pick" q={q} first={i === 0} last={i === picks.length - 1} />
                    <form action={promoRemoveAction}>
                      <Hidden id={p.id} kind="pick" q={q} />
                      <button className="a-btn is-danger-ghost p-sm" type="submit">내리기</button>
                    </form>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="a-card" aria-labelledby="pr-hot-title">
            <div className="pr-head">
              <h2 id="pr-hot-title" className="pr-h2">
                핫딜 <b>{hots.length}</b>
              </h2>
              {hots.length > 0 && <ClearAll kind="hot" label="핫딜" q={q} />}
            </div>
            <p className="a-sub">카드에 붙는 짧은 문구(예: &lsquo;공구가 30%&rsquo;)와 마감일을 정할 수 있어요. 마감일 다음 날부터 사이트에서 자동으로 빠져요.</p>
            <ol className="pr-list">
              {hots.length === 0 && <li className="a-empty">아직 없어요. 위에서 제품을 찾아 올려 주세요. (없으면 사이트에서 이 묶음은 숨겨져요)</li>}
              {hots.map((p, i) => (
                <li key={p.id} className="pr-row is-col">
                  <div className="pr-row-top">
                    <ProdCell p={p} b={bmap.get(p.brand_id)} warn={why(p, true)} />
                    <div className="pr-acts">
                      <Move id={p.id} kind="hot" q={q} first={i === 0} last={i === hots.length - 1} />
                      <form action={promoRemoveAction}>
                        <Hidden id={p.id} kind="hot" q={q} />
                        <button className="a-btn is-danger-ghost p-sm" type="submit">내리기</button>
                      </form>
                    </div>
                  </div>
                  <form action={promoSaveHotAction} className="pr-hot-form">
                    <Hidden id={p.id} kind="hot" q={q} />
                    <label>
                      <span>카드 문구</span>
                      <input className="a-input" name="hot_note" defaultValue={p.hot_note ?? ""} maxLength={60} placeholder="비우면 '핫딜'" />
                    </label>
                    <label>
                      <span>마감일</span>
                      <input className="a-input" type="date" name="hot_until" defaultValue={p.hot_until ?? ""} />
                    </label>
                    <button className="a-btn is-ghost p-sm" type="submit">저장</button>
                  </form>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </>
  );
}

function Hidden({ id, kind, q }: { id: string; kind: "pick" | "hot"; q: string }) {
  return (
    <>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      {q && <input type="hidden" name="q" value={q} />}
    </>
  );
}

function ProdCell({ p, b, warn }: { p: ToProduct; b?: PartnerBrand; warn?: string | null }) {
  return (
    <div className="p-prod pr-prod">
      <Thumb src={p.image_url} size={44} />
      <div>
        <a className="a-name" href={`/to/products/${p.id}`}>{p.name}</a>
        <div className="a-sub">
          {b?.name_ko ?? "–"} · {p.serial ?? "일련번호 없음"}
        </div>
        {warn && <div className="p-reason">{warn}</div>}
      </div>
    </div>
  );
}

function Move({ id, kind, q, first, last }: { id: string; kind: "pick" | "hot"; q: string; first: boolean; last: boolean }) {
  return (
    <span className="pr-move">
      <form action={promoMoveAction}>
        <Hidden id={id} kind={kind} q={q} />
        <input type="hidden" name="dir" value="up" />
        <button className="a-btn is-ghost p-sm" type="submit" disabled={first} aria-label="한 칸 위로">↑</button>
      </form>
      <form action={promoMoveAction}>
        <Hidden id={id} kind={kind} q={q} />
        <input type="hidden" name="dir" value="down" />
        <button className="a-btn is-ghost p-sm" type="submit" disabled={last} aria-label="한 칸 아래로">↓</button>
      </form>
    </span>
  );
}

function ClearAll({ kind, label, q }: { kind: "pick" | "hot"; label: string; q: string }) {
  return (
    <details className="pr-clear">
      <summary>모두 내리기</summary>
      <form action={promoClearAction}>
        <input type="hidden" name="kind" value={kind} />
        {q && <input type="hidden" name="q" value={q} />}
        <span className="a-sub">{label}을 모두 내릴까요?</span>
        <button className="a-btn is-danger p-sm" type="submit">네, 모두 내리기</button>
      </form>
    </details>
  );
}
