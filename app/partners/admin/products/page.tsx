import type { Metadata } from "next";
import { requireSession } from "@/lib/partners/auth";
import { ensureSeeded, listBrands, listProducts } from "@/lib/partners/db";
import { CATEGORIES, STATUS_LABEL, type ProductStatus } from "@/lib/partners/model";
import PTop, { PHead } from "../../PTop";
import { RequestTags, StatusBadge, Thumb } from "../../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "전체 제품" };

type SP = Promise<{ category?: string; brand?: string; status?: string; q?: string; avail?: string; deleted?: string }>;

export default async function AdminProducts({ searchParams }: { searchParams: SP }) {
  const s = await requireSession({ role: "admin" });
  const sp = await searchParams;
  await ensureSeeded().catch(() => false);
  const [brands, all] = await Promise.all([listBrands(), listProducts()]);
  const bmap = new Map(brands.map((b) => [b.id, b]));
  const category = CATEGORIES.find((c) => c.key === sp.category)?.key;
  const brand = brands.find((b) => b.id === sp.brand);
  const status = (Object.keys(STATUS_LABEL) as ProductStatus[]).find((x) => x === sp.status);
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 60);
  const avail = sp.avail === "sponsor" || sp.avail === "rental" ? sp.avail : undefined;

  const scoped = all.filter((p) => {
    const b = bmap.get(p.brand_id);
    return (!category || b?.category === category) && (!brand || p.brand_id === brand.id);
  });
  const rows = scoped
    .filter(
      (p) =>
        (!status || p.status === status) &&
        (!avail || p[avail]) &&
        (!q || [p.name, p.serial ?? "", p.feature ?? "", bmap.get(p.brand_id)?.name_ko ?? ""].some((x) => x.toLowerCase().includes(q))),
    )
    .sort((a, b) => (bmap.get(a.brand_id)?.sort ?? 0) - (bmap.get(b.brand_id)?.sort ?? 0) || a.sort - b.sort);

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const base = { category, brand: brand?.id, status, q: sp.q, avail, ...patch };
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
    const str = p.toString();
    return `/admin/products${str ? `?${str}` : ""}`;
  };

  return (
    <>
      <PTop s={s} current="a-products" />
      <main className="a-wrap">
        <PHead
          crumb="제품 관리"
          title="전체 제품"
          desc="관리자가 여기서 고치면 승인 없이 바로 반영돼요."
          actions={<a className="a-btn" href={`/admin/products/new${brand ? `?brand=${brand.id}` : ""}`}>+ 제품 추가</a>}
        />
        {sp.deleted && <p className="a-saved" role="status">제품을 삭제했어요.</p>}

        <nav className="a-tabs" aria-label="상태">
          <a className="a-tab" href={qs({ status: undefined })} aria-current={!status ? "page" : undefined}>전체 <b>{scoped.length}</b></a>
          {(Object.keys(STATUS_LABEL) as ProductStatus[]).map((x) => (
            <a key={x} className="a-tab" href={qs({ status: x })} aria-current={status === x ? "page" : undefined}>
              {STATUS_LABEL[x]} <b>{scoped.filter((p) => p.status === x).length}</b>
            </a>
          ))}
        </nav>

        <form className="a-filter" method="get" action="/admin/products">
          {status && <input type="hidden" name="status" value={status} />}
          <select className="a-select" name="category" defaultValue={category ?? ""} aria-label="분류">
            <option value="">전체 분류</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.no}. {c.label}</option>
            ))}
          </select>
          <select className="a-select" name="brand" defaultValue={brand?.id ?? ""} aria-label="브랜드">
            <option value="">전체 브랜드</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name_ko}</option>
            ))}
          </select>
          <select className="a-select" name="avail" defaultValue={avail ?? ""} aria-label="진행 가능">
            <option value="">협찬·대여 전체</option>
            <option value="sponsor">협찬 가능만</option>
            <option value="rental">대여 가능만</option>
          </select>
          <input className="a-input" type="search" name="q" defaultValue={sp.q ?? ""} placeholder="제품명·일련번호·특징 검색" aria-label="검색" />
          <button className="a-btn is-ghost" type="submit">적용</button>
          {(category || brand || q || avail) && <a className="a-sub" href={qs({ category: undefined, brand: undefined, q: undefined, avail: undefined })}>필터 지우기</a>}
        </form>

        <section className="a-card" aria-label="제품 목록">
          <div className="a-table-box">
            <table className="a-table p-table">
              <thead>
                <tr>
                  <th scope="col">제품</th>
                  <th scope="col">브랜드</th>
                  <th scope="col">일련번호</th>
                  <th scope="col">협찬·대여</th>
                  <th scope="col">상태</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const b = bmap.get(p.brand_id);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="p-prod">
                          <Thumb src={p.image_url} size={48} />
                          <div>
                            <a className="a-name" href={`/admin/products/${p.id}`}>{p.name}</a>
                            {p.note && <div className="a-sub">{p.note}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="a-nowrap">
                        <a href={qs({ brand: p.brand_id })}>{b?.name_ko}</a>
                        {b && !b.active && <div className="a-sub">사용 중지</div>}
                      </td>
                      <td className="a-nowrap">{p.serial ?? "–"}</td>
                      <td className="a-nowrap">협찬 {p.sponsor ? "가능" : "-"} · 대여 {p.rental ? "가능" : "-"}</td>
                      <td className="a-nowrap"><StatusBadge status={p.status} /> <RequestTags p={p} /></td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="a-empty">조건에 맞는 제품이 없어요.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <p className="a-sub">{rows.length.toLocaleString("ko-KR")}개 표시</p>
      </main>
    </>
  );
}
