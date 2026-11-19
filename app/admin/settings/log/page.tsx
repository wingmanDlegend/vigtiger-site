import type { Metadata } from "next";
import { requireAdmin } from "@/lib/partners/auth";
import { listBrands, listEvents } from "@/lib/partners/db";
import { fmtDate } from "@/lib/partners/model";
import AdminTop from "@/app/admin/AdminTop";
import { PageHead as PHead } from "@/app/admin/SubNav";
import { eventLabel } from "@/app/admin/to/events";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "작업 기록" };

export default async function AdminLog({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const brands = await listBrands();
  const brand = brands.find((b) => b.id === sp.brand);
  const events = await listEvents({ brandId: brand?.id, limit: 300 });
  const bname = new Map(brands.map((b) => [b.id, b.name_ko]));
  return (
    <>
      <AdminTop current="log" />
      <main className="a-wrap">
        <PHead crumb="설정" title="작업 기록" desc="누가 언제 무엇을 했는지 최근 300건을 보여요." />
        <form className="a-filter" method="get" action="/settings/log">
          <select className="a-select" name="brand" defaultValue={brand?.id ?? ""} aria-label="브랜드">
            <option value="">전체 브랜드</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name_ko}</option>
            ))}
          </select>
          <button className="a-btn is-ghost" type="submit">적용</button>
        </form>
        <section className="a-card" aria-label="작업 기록">
          <div className="a-table-box">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">시각</th>
                  <th scope="col">한 사람</th>
                  <th scope="col">작업</th>
                  <th scope="col">브랜드</th>
                  <th scope="col">내용</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className="a-nowrap a-sub">{fmtDate(e.created_at)}</td>
                    <td>{e.actor_label ?? "–"}</td>
                    <td className="a-nowrap">{eventLabel(e.action)}</td>
                    <td className="a-nowrap">{e.brand_id ? bname.get(e.brand_id) ?? "–" : "–"}</td>
                    <td className="a-sub">
                      {e.product_id ? <a href={`/to/products/${e.product_id}`}>{String(e.detail?.name ?? "제품")}</a> : (e.detail?.name as string) ?? ""}
                      {typeof e.detail?.serial === "string" ? ` (${e.detail.serial})` : ""}
                      {typeof e.detail?.reason === "string" ? ` — ${e.detail.reason}` : ""}
                      {Array.isArray(e.detail?.fields) ? ` — ${(e.detail.fields as string[]).join(", ")}` : ""}
                      {typeof e.detail?.email === "string" ? ` ${e.detail.email}` : ""}
                    </td>
                  </tr>
                ))}
                {events.length === 0 && <tr><td colSpan={5} className="a-empty">기록이 없어요.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
