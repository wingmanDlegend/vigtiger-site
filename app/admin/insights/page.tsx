import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { listInsights } from "@/lib/admin/insights";
import { kst } from "@/lib/admin/format";
import { KIND_META, formatKoDate } from "@/lib/insights";
import AdminTop from "../AdminTop";

export const dynamic = "force-dynamic";

const BADGE = {
  draft: { label: "검토 대기", bg: "#fff1e6", fg: "#a12a00" },
  published: { label: "게시됨", bg: "#e9f7ee", fg: "#11552a" },
};

export default async function AdminInsights({ searchParams }: { searchParams: Promise<{ deleted?: string; kind?: string }> }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const sp = await searchParams;
  const kind = sp.kind === "trends" || sp.kind === "hot" ? sp.kind : undefined;
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
      <AdminTop current="insights" />
      <main className="a-wrap">
        <h1 className="a-h1">인사이트</h1>
        {sp.deleted === "1" && <p className="a-saved" role="status">글 1건을 삭제했습니다.</p>}
        <p className="a-sub">
          평일 아침마다 <b>업계 동향</b>(기사 정리)과 <b>Hot Contents</b>(어제의 화제 콘텐츠) 초안이 자동으로 만들어집니다. 내용을 확인·수정한 뒤 <b>게시</b>를 누르면 홈페이지{" "}
          <a href="/insights" target="_blank" rel="noopener noreferrer">인사이트</a> 메뉴에 올라갑니다.
          {" "}오전 9시 30분까지 게시하지 않은 그날 초안은 <b>자동으로 게시</b>되고, 홈 화면 Today&apos;s Issue도 함께 바뀝니다.
          {drafts > 0 && <> 지금 검토 대기 중인 초안이 <b>{drafts}건</b> 있어요.</>}
        </p>
        <nav className="a-tabs" aria-label="종류">
          <a className="a-tab" href="/admin/insights" aria-current={!kind ? "page" : undefined}>전체</a>
          <a className="a-tab" href="/admin/insights?kind=trends" aria-current={kind === "trends" ? "page" : undefined}>업계 동향</a>
          <a className="a-tab" href="/admin/insights?kind=hot" aria-current={kind === "hot" ? "page" : undefined}>Hot Contents</a>
        </nav>
        {error && <p className="a-error" role="alert">{error}</p>}
        <section className="a-card" aria-label="인사이트 글 목록">
          <div className="a-table-box">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">날짜</th>
                  <th scope="col">종류</th>
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
                      <td className="a-nowrap"><span className="a-type">{KIND_META[r.kind].label}</span></td>
                      <td>
                        <a className="a-name" href={`/admin/insights/${r.id}`}>{r.title}</a>
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
                    <td colSpan={6} className="a-empty">아직 글이 없어요. 내일 아침 첫 초안이 만들어집니다.</td>
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
