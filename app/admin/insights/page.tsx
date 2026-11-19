import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { listInsights } from "@/lib/admin/insights";
import { kst } from "@/lib/admin/format";
import { formatKoDate } from "@/lib/insights";
import { ADMIN_KIND_LABEL } from "@/lib/admin/nav";
import { PageHead } from "../SubNav";
import AdminTop from "../AdminTop";

export const dynamic = "force-dynamic";

const BADGE = {
  draft: { label: "검토 대기", bg: "#fff1e6", fg: "#a12a00" },
  published: { label: "게시됨", bg: "#e9f7ee", fg: "#11552a" },
};

export default async function AdminInsights({ searchParams }: { searchParams: Promise<{ deleted?: string; kind?: string }> }) {
  if (!(await isAuthed())) redirect("/login");
  const sp = await searchParams;
  // 콘텐츠는 메뉴에서 종류를 고르는 단일 목록 — 종류가 없으면 업계 동향으로
  if (sp.kind !== "trends" && sp.kind !== "hot") redirect(`/insights?kind=trends${sp.deleted ? "&deleted=1" : ""}`);
  const kind = sp.kind;
  let rows: Awaited<ReturnType<typeof listInsights>> = [];
  let error = "";
  try {
    rows = await listInsights(kind);
  } catch (e) {
    error = e instanceof Error ? e.message : "불러오지 못했습니다.";
  }
  const drafts = rows.filter((r) => r.status === "draft").length;

  return (
    <>
      <AdminTop current={kind} />
      <main className="a-wrap">
        <PageHead
          crumb="콘텐츠"
          title={ADMIN_KIND_LABEL[kind]}
          desc={
            <>
              {kind === "trends"
                ? "평일 07:47에 국내외 인플루언서 마케팅 기사 정리 초안이 만들어집니다."
                : "평일 08:13에 어제 화제가 된 소셜 콘텐츠 추천 초안이 만들어집니다."}{" "}
              확인·수정 후 <b>게시</b>하면 홈페이지{" "}
              <a href={kind === "trends" ? "/insights/trends" : "/insights/hot"} target="_blank" rel="noopener noreferrer">
                인사이트
              </a>
              와 홈 Today&apos;s Issue에 올라가고, <b>09:30까지 게시하지 않은 그날 초안은 자동 게시</b>됩니다.
            </>
          }
        />
        {sp.deleted === "1" && <p className="a-saved" role="status">글 1건을 삭제했습니다.</p>}
        {drafts > 0 && (
          <p className="a-note" role="status">
            검토 대기 중인 초안이 {drafts}건 있어요.
          </p>
        )}
        {error && <p className="a-error" role="alert">{error}</p>}
        <section className="a-card" aria-label="인사이트 글 목록">
          <div className="a-table-box">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">날짜</th>
                  <th scope="col">제목</th>
                  <th scope="col">항목</th>
                  <th scope="col">상태</th>
                  <th scope="col">마지막 수정</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const b = BADGE[r.status];
                  return (
                    <tr key={r.id}>
                      <td className="a-nowrap">{formatKoDate(r.post_date)}</td>
                      <td>
                        <a className="a-name" href={`/insights/${r.id}`}>{r.title}</a>
                      </td>
                      <td className="a-nowrap">{r.items.length}건</td>
                      <td>
                        <span className="a-badge" style={{ background: b.bg, color: b.fg }}>{b.label}</span>
                      </td>
                      <td className="a-nowrap a-sub">{kst(r.updated_at)}</td>
                    </tr>
                  );
                })}
                {rows.length === 0 && !error && (
                  <tr>
                    <td colSpan={5} className="a-empty">아직 글이 없어요. 내일 아침 첫 초안이 만들어집니다.</td>
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
