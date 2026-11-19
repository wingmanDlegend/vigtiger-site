import type { Metadata } from "next";
import { requireSession } from "@/lib/partners/auth";
import { ensureSeeded, listBrands, listProducts, listUsers } from "@/lib/partners/db";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/partners/model";
import PTop, { PHead } from "../../PTop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "브랜드·계정" };

type SP = Promise<{ category?: string; account?: string; q?: string; deleted?: string }>;

export default async function AdminBrands({ searchParams }: { searchParams: SP }) {
  const s = await requireSession({ role: "admin" });
  const sp = await searchParams;
  await ensureSeeded().catch(() => false);
  const [brands, products, users] = await Promise.all([listBrands(), listProducts(), listUsers()]);
  const category = CATEGORIES.find((c) => c.key === sp.category)?.key;
  const q = (sp.q ?? "").trim().toLowerCase();
  const stats = new Map<string, { live: number; waiting: number }>();
  for (const p of products) {
    const st = stats.get(p.brand_id) ?? { live: 0, waiting: 0 };
    if (p.status === "approved") st.live++;
    if (p.status === "pending" || p.pending_changes || p.delete_requested) st.waiting++;
    stats.set(p.brand_id, st);
  }
  const accounts = new Map<string, number>();
  for (const u of users) if (u.brand_id && u.active) accounts.set(u.brand_id, (accounts.get(u.brand_id) ?? 0) + 1);
  const rows = brands.filter(
    (b) =>
      (!category || b.category === category) &&
      (sp.account !== "none" || (b.active && !accounts.get(b.id))) &&
      (!q || [b.name_ko, b.name_en ?? "", b.code].some((x) => x.toLowerCase().includes(q))),
  );
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ category, account: sp.account, q: sp.q, ...patch })) if (v) p.set(k, v);
    const str = p.toString();
    return `/admin/brands${str ? `?${str}` : ""}`;
  };

  return (
    <>
      <PTop s={s} current="a-brands" />
      <main className="a-wrap">
        <PHead
          crumb="파트너"
          title="브랜드·계정"
          desc="브랜드를 열어 담당자 계정을 발급하면, 담당자가 직접 제품을 등록·수정할 수 있어요."
          actions={<a className="a-btn" href="/admin/brands/new">+ 브랜드 추가</a>}
        />
        {sp.deleted && <p className="a-saved" role="status">브랜드를 삭제했어요.</p>}
        <nav className="a-tabs" aria-label="분류">
          <a className="a-tab" href={qs({ category: undefined })} aria-current={!category ? "page" : undefined}>전체 <b>{brands.length}</b></a>
          {CATEGORIES.map((c) => (
            <a key={c.key} className="a-tab" href={qs({ category: c.key })} aria-current={category === c.key ? "page" : undefined}>
              {c.label} <b>{brands.filter((b) => b.category === c.key).length}</b>
            </a>
          ))}
        </nav>
        <form className="a-filter" method="get" action="/admin/brands">
          {category && <input type="hidden" name="category" value={category} />}
          <input className="a-input" type="search" name="q" defaultValue={sp.q ?? ""} placeholder="브랜드 이름·코드 검색" aria-label="검색" />
          <label className="gb-check">
            <input type="checkbox" name="account" value="none" defaultChecked={sp.account === "none"} /> 계정 미발급만
          </label>
          <button className="a-btn is-ghost" type="submit">적용</button>
        </form>
        <section className="a-card" aria-label="브랜드 목록">
          <div className="a-table-box">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">브랜드</th>
                  <th scope="col">코드</th>
                  <th scope="col">분류</th>
                  <th scope="col" className="gb-r">게시 중 제품</th>
                  <th scope="col" className="gb-r">승인 대기</th>
                  <th scope="col">담당자 계정</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => {
                  const st = stats.get(b.id) ?? { live: 0, waiting: 0 };
                  const n = accounts.get(b.id) ?? 0;
                  return (
                    <tr key={b.id}>
                      <td>
                        <a className="a-name" href={`/admin/brands/${b.id}`}>{b.name_ko}</a>
                        {b.name_en && <span className="a-sub"> {b.name_en}</span>}
                        {!b.active && <div className="a-sub">사용 중지</div>}
                        {b.pending_changes && <div><span className="p-tag is-brand">정보 수정 요청</span></div>}
                      </td>
                      <td className="a-nowrap">{b.code}</td>
                      <td className="a-nowrap">{CATEGORY_LABEL[b.category]}</td>
                      <td className="gb-r"><a href={`/admin/products?brand=${b.id}`}>{st.live}</a></td>
                      <td className="gb-r">{st.waiting ? <b>{st.waiting}</b> : "–"}</td>
                      <td className="a-nowrap">{n ? `${n}개` : <span className="p-tag is-del">미발급</span>}</td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="a-empty">조건에 맞는 브랜드가 없어요.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
