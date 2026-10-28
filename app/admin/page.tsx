import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { countAll, listApplications, STATUSES, type Status } from "@/lib/admin/db";
import { STATUS_LABEL, STATUS_STYLE, TYPE_LABEL, kst, summary } from "@/lib/admin/format";
import { quickStatus } from "./actions";
import AdminTop from "./AdminTop";

export const dynamic = "force-dynamic";

type SP = Promise<{ type?: string; status?: string; q?: string; page?: string }>;

export default async function AdminHome({ searchParams }: { searchParams: SP }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const sp = await searchParams;
  const type = ["creator", "advertiser", "partner"].includes(sp.type ?? "") ? sp.type : undefined;
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "") ? (sp.status as Status) : undefined;
  const q = (sp.q ?? "").slice(0, 60);
  const page = Math.max(1, Number(sp.page) || 1);

  let error = "";
  let data: Awaited<ReturnType<typeof listApplications>> = { rows: [], total: 0, page, pageSize: 50 };
  let counts: Awaited<ReturnType<typeof countAll>> | null = null;
  try {
    [data, counts] = await Promise.all([listApplications({ type, status, q, page }), countAll()]);
  } catch (e) {
    error = e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.";
  }

  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { type, status, q: q || undefined, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin?${s}` : "/admin";
  };
  const exportHref = (() => {
    const p = new URLSearchParams();
    if (type) p.set("type", type);
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/admin/export${s ? `?${s}` : ""}`;
  })();
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <>
      <AdminTop />
      <main className="a-wrap">
        <h1 className="a-h1">신청 접수 내역</h1>

        <nav className="a-tabs" aria-label="신청 유형">
          <a className="a-tab" href={href({ type: undefined, page: undefined })} aria-current={!type ? "page" : undefined}>
            전체 <b>{counts?.all ?? "-"}</b>
          </a>
          {(["creator", "advertiser", "partner"] as const).map((t) => (
            <a key={t} className="a-tab" href={href({ type: t, page: undefined })} aria-current={type === t ? "page" : undefined}>
              {TYPE_LABEL[t]} <b>{counts?.type[t] ?? "-"}</b>
            </a>
          ))}
        </nav>

        <div className="a-tools">
          <form className="a-filter" action="/admin" method="get">
            {type && <input type="hidden" name="type" value={type} />}
            <label className="a-sub" htmlFor="f-status">상태</label>
            <select id="f-status" name="status" className="a-select" defaultValue={status ?? ""}>
              <option value="">전체 상태</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]} ({counts?.status[s] ?? 0})
                </option>
              ))}
            </select>
            <label className="a-sub" htmlFor="f-q">검색</label>
            <input id="f-q" name="q" className="a-input" defaultValue={q} placeholder="이름·회사·이메일·연락처" />
            <button className="a-btn" type="submit">적용</button>
            {(status || q) && (
              <a className="a-btn is-ghost" href={href({ status: undefined, q: undefined, page: undefined })}>초기화</a>
            )}
          </form>
          <a className="a-btn is-ghost" href={exportHref}>엑셀(CSV) 내려받기</a>
        </div>

        {error && <p className="a-error" role="alert">{error}</p>}

        <section className="a-card" aria-label="신청 목록">
          <div className="a-table-box">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">접수일시</th>
                  <th scope="col">유형</th>
                  <th scope="col">이름 / 회사·채널</th>
                  <th scope="col">연락처</th>
                  <th scope="col">핵심 정보</th>
                  <th scope="col">상태</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((a) => {
                  const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.new;
                  return (
                    <tr key={a.id}>
                      <td className="a-nowrap">
                        {kst(a.created_at)}
                        {a.lang === "en" && <div className="a-sub">영문 페이지</div>}
                      </td>
                      <td><span className="a-type">{TYPE_LABEL[a.type]}</span></td>
                      <td>
                        <a className="a-name" href={`/admin/${a.id}`}>{a.name}</a>
                        {a.admin_note && <span className="a-note-dot">메모</span>}
                        <div className="a-sub">{a.company ?? "-"}</div>
                      </td>
                      <td className="a-nowrap">
                        <div>{a.phone ?? "-"}</div>
                        <div className="a-sub">{a.email}</div>
                      </td>
                      <td className="a-summary">{summary(a) || "-"}</td>
                      <td>
                        <div style={{ marginBottom: 6 }}>
                          <span className="a-badge" style={{ background: st.bg, color: st.fg }}>{STATUS_LABEL[a.status]}</span>
                        </div>
                        <form action={quickStatus} className="a-quick">
                          <input type="hidden" name="id" value={a.id} />
                          <label className="a-sub" htmlFor={`s-${a.id}`} style={{ position: "absolute", left: -9999 }}>상태 변경</label>
                          <select id={`s-${a.id}`} name="status" className="a-select" defaultValue={a.status}>
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                          </select>
                          <button className="a-btn is-ghost" type="submit">변경</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!error && data.rows.length === 0 && <p className="a-empty">조건에 맞는 신청이 없습니다.</p>}
          </div>
          {pages > 1 && (
            <div className="a-pager">
              <span className="a-sub">{data.total}건 중 {(page - 1) * data.pageSize + 1}–{Math.min(page * data.pageSize, data.total)}</span>
              {page > 1 && <a className="a-btn is-ghost" href={href({ page: String(page - 1) })}>이전</a>}
              {page < pages && <a className="a-btn is-ghost" href={href({ page: String(page + 1) })}>다음</a>}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
