import type { Metadata } from "next";
import { requireAdmin } from "@/lib/partners/auth";
import { ensureSeeded, listBrandChangeRequests, listBrands, listEvents, listProducts, listReviewQueue, listUsers } from "@/lib/partners/db";
import { CATEGORIES, fmtDate } from "@/lib/partners/model";
import AdminTop from "@/app/admin/AdminTop";
import { PageHead as PHead } from "@/app/admin/SubNav";
import { eventLabel } from "./events";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "홈" };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ pw?: string }> }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  let seeded = false;
  let error = "";
  try {
    seeded = await ensureSeeded();
  } catch (e) {
    error = e instanceof Error ? e.message : "초기 데이터를 넣지 못했어요.";
  }
  const [brands, products, queue, brandReq, users, events] = await Promise.all([
    listBrands(),
    listProducts(),
    listReviewQueue(),
    listBrandChangeRequests(),
    listUsers(),
    listEvents({ limit: 12 }),
  ]);
  const live = products.filter((p) => p.status === "approved");
  const newReq = queue.filter((p) => p.status === "pending").length;
  const editReq = queue.filter((p) => p.status !== "pending" && p.pending_changes && !p.delete_requested).length;
  const delReq = queue.filter((p) => p.delete_requested).length;
  const brandUsers = new Set(users.filter((u) => u.role === "brand" && u.active).map((u) => u.brand_id));
  const activeBrands = brands.filter((b) => b.active);
  const noAccount = activeBrands.filter((b) => !brandUsers.has(b.id));
  const brandName = new Map(brands.map((b) => [b.id, b.name_ko]));

  return (
    <>
      <AdminTop current="to-home" />
      <main className="a-wrap">
        <PHead crumb="티오 파트너스" title="티오 제품 관리 현황" desc="브랜드 담당자가 올린 등록·수정·삭제 요청을 승인하면 제품 리스트에 반영돼요." />
        {seeded && <p className="a-saved" role="status">티오 제품 리스트(PDF)에 있던 브랜드 {brands.length}곳, 제품 {products.length}개를 초기 데이터로 넣었어요.</p>}
        {sp.pw && <p className="a-saved" role="status">비밀번호를 바꿨어요.</p>}
        {error && <p className="a-error" role="alert">{error}</p>}

        <section className="db-kpis" aria-label="요약">
          <a className={`a-card db-kpi ${queue.length + brandReq.length ? "is-warn" : ""}`} href="/to/review">
            <span className="db-kpi-label">승인 대기</span>
            <b className="db-kpi-value">{queue.length + brandReq.length}건</b>
            <span className="db-kpi-sub">
              <span>새 제품 {newReq} · 수정 {editReq} · 삭제 {delReq} · 브랜드 {brandReq.length}</span>
            </span>
          </a>
          <a className="a-card db-kpi" href="/to/products?status=approved">
            <span className="db-kpi-label">게시 중 제품</span>
            <b className="db-kpi-value">{live.length.toLocaleString("ko-KR")}개</b>
            <span className="db-kpi-sub"><span>협찬 가능 {live.filter((p) => p.sponsor).length} · 대여 가능 {live.filter((p) => p.rental).length}</span></span>
          </a>
          <a className="a-card db-kpi" href="/to/brands">
            <span className="db-kpi-label">협업 브랜드</span>
            <b className="db-kpi-value">{activeBrands.length}곳</b>
            <span className="db-kpi-sub"><span>사용 중지 {brands.length - activeBrands.length}곳</span></span>
          </a>
          <a className={`a-card db-kpi ${noAccount.length ? "is-warn" : ""}`} href="/to/brands?account=none">
            <span className="db-kpi-label">계정 미발급 브랜드</span>
            <b className="db-kpi-value">{noAccount.length}곳</b>
            <span className="db-kpi-sub"><span>브랜드 계정 {users.filter((u) => u.role === "brand").length}개 발급</span></span>
          </a>
        </section>

        <div className="p-cols">
          <section className="a-card a-sec">
            <h2>분류별 현황</h2>
            <div className="a-table-box">
              <table className="a-table">
                <thead>
                  <tr>
                    <th scope="col">분류</th>
                    <th scope="col" className="gb-r">브랜드</th>
                    <th scope="col" className="gb-r">게시 중 제품</th>
                    <th scope="col" className="gb-r">대여 가능</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map((c) => {
                    const bs = activeBrands.filter((b) => b.category === c.key);
                    const ids = new Set(bs.map((b) => b.id));
                    const ps = live.filter((p) => ids.has(p.brand_id));
                    return (
                      <tr key={c.key}>
                        <td><a className="a-name" href={`/to/products?category=${c.key}`}>{c.no}. {c.label}</a></td>
                        <td className="gb-r">{bs.length}</td>
                        <td className="gb-r">{ps.length}</td>
                        <td className="gb-r">{ps.filter((p) => p.rental).length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="a-card a-sec">
            <h2>최근 작업</h2>
            <ol className="p-log">
              {events.map((e) => (
                <li key={e.id}>
                  <span className="a-sub a-nowrap">{fmtDate(e.created_at)}</span>
                  <span>
                    <b>{e.actor_label ?? "–"}</b> · {eventLabel(e.action)}
                    {e.brand_id && brandName.get(e.brand_id) ? ` · ${brandName.get(e.brand_id)}` : ""}
                    {typeof e.detail?.name === "string" ? ` · ${e.detail.name}` : ""}
                  </span>
                </li>
              ))}
              {events.length === 0 && <li className="a-sub">아직 기록이 없어요.</li>}
            </ol>
            <a className="a-sub" href="/settings/log">작업 기록 전체 보기 →</a>
          </section>
        </div>
      </main>
    </>
  );
}
