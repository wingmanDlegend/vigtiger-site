import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { listGroupbuys } from "@/lib/admin/groupbuys";
import {
  RERUN_LABEL,
  STATUS_LABEL,
  STATUS_STYLE,
  conversionRate,
  num,
  period,
  won,
  type GBStatus,
  type GroupBuy,
} from "@/lib/groupbuy";
import AdminTop from "../AdminTop";
import { SectionTabs } from "../SubNav";

export const dynamic = "force-dynamic";

type SP = Promise<{ status?: string; q?: string; year?: string; unsettled?: string; deleted?: string; saved?: string }>;

const STATUSES: GBStatus[] = ["planned", "live", "done", "canceled"];

function sum(rows: GroupBuy[], k: "revenue" | "units" | "creator_payout" | "company_profit") {
  return rows.reduce((n, r) => n + (r[k] ?? 0), 0);
}

function topBy(rows: GroupBuy[], key: "brand" | "creator") {
  const m = new Map<string, { revenue: number; count: number; units: number }>();
  for (const r of rows) {
    const e = m.get(r[key]) ?? { revenue: 0, count: 0, units: 0 };
    e.revenue += r.revenue ?? 0;
    e.units += r.units ?? 0;
    e.count += 1;
    m.set(r[key], e);
  }
  return [...m.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
}

export default async function AdminGroupbuys({ searchParams }: { searchParams: SP }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const sp = await searchParams;
  let all: GroupBuy[] = [];
  let error = "";
  try {
    all = await listGroupbuys();
  } catch (e) {
    error = e instanceof Error ? e.message : "불러오지 못했습니다.";
  }

  const status = STATUSES.includes(sp.status as GBStatus) ? (sp.status as GBStatus) : undefined;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 60);
  const years = [...new Set(all.map((r) => (r.start_date ?? r.created_at).slice(0, 4)))].sort().reverse();
  const year = years.includes(sp.year ?? "") ? sp.year : undefined;
  const unsettled = sp.unsettled === "1";

  const inYear = year ? all.filter((r) => (r.start_date ?? r.created_at).startsWith(year)) : all;
  const rows = inYear.filter(
    (r) =>
      (!status || r.status === status) &&
      (!unsettled || (!r.settled && r.status === "done")) &&
      (!q || [r.brand, r.product, r.creator, r.platform ?? ""].some((s) => s.toLowerCase().includes(q))),
  );
  const counted = rows.filter((r) => r.status !== "canceled");
  const unsettledCount = inYear.filter((r) => !r.settled && r.status === "done").length;

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const base = { status, q: sp.q, year, unsettled: unsettled ? "1" : undefined, ...patch };
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <>
      <AdminTop current="groupbuys" />
      <main className="a-wrap">
        <SectionTabs section="groupbuys" current="list" />
        <div className="a-tools">
          <h1 className="a-h1">공동구매 결과</h1>
          <div className="a-row">
            <a className="a-btn" href="/admin/groupbuys/new">+ 결과 입력</a>
            <a className="a-btn is-ghost" href="/admin/groupbuys/import">엑셀 업로드</a>
            <a className="a-btn is-ghost" href={`/admin/groupbuys/export${qs({})}`}>엑셀(CSV) 내려받기</a>
          </div>
        </div>
        {sp.deleted === "1" && <p className="a-saved" role="status">기록 1건을 삭제했습니다.</p>}
        {sp.saved && <p className="a-saved" role="status">{sp.saved}</p>}
        {error && <p className="a-error" role="alert">{error}</p>}

        <section className="gb-kpis" aria-label="요약 (취소 건 제외)">
          <div className="a-card gb-kpi"><span>공동구매</span><b>{num(counted.length)}건</b></div>
          <div className="a-card gb-kpi"><span>총 매출</span><b>{won(sum(counted, "revenue"))}</b></div>
          <div className="a-card gb-kpi"><span>판매 수량</span><b>{num(sum(counted, "units"))}개</b></div>
          <div className="a-card gb-kpi"><span>크리에이터 정산</span><b>{won(sum(counted, "creator_payout"))}</b></div>
          <div className="a-card gb-kpi"><span>회사 수익</span><b>{won(sum(counted, "company_profit"))}</b></div>
          <a className={`a-card gb-kpi ${unsettledCount ? "is-warn" : ""}`} href={qs({ unsettled: unsettled ? undefined : "1" })}>
            <span>정산 대기 (완료 건)</span>
            <b>{num(unsettledCount)}건</b>
          </a>
        </section>

        <nav className="a-tabs" aria-label="상태">
          <a className="a-tab" href={qs({ status: undefined })} aria-current={!status ? "page" : undefined}>
            전체 <b>{inYear.length}</b>
          </a>
          {STATUSES.map((s) => (
            <a key={s} className="a-tab" href={qs({ status: s })} aria-current={status === s ? "page" : undefined}>
              {STATUS_LABEL[s]} <b>{inYear.filter((r) => r.status === s).length}</b>
            </a>
          ))}
        </nav>

        <form className="a-filter" method="get" action="/admin/groupbuys">
          {status && <input type="hidden" name="status" value={status} />}
          <select className="a-select" name="year" defaultValue={year ?? ""} aria-label="연도">
            <option value="">전체 기간</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <input className="a-input" type="search" name="q" defaultValue={sp.q ?? ""} placeholder="브랜드·제품·크리에이터 검색" aria-label="검색" />
          <label className="gb-check">
            <input type="checkbox" name="unsettled" value="1" defaultChecked={unsettled} /> 정산 대기만
          </label>
          <button className="a-btn is-ghost" type="submit">적용</button>
          {(q || year || unsettled) && <a className="a-sub" href={qs({ q: undefined, year: undefined, unsettled: undefined })}>필터 지우기</a>}
        </form>

        <section className="a-card" aria-label="공동구매 목록">
          <div className="a-table-box">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">기간</th>
                  <th scope="col">브랜드 · 제품</th>
                  <th scope="col">크리에이터</th>
                  <th scope="col">상태</th>
                  <th scope="col" className="gb-r">판매 수량</th>
                  <th scope="col" className="gb-r">총 매출</th>
                  <th scope="col" className="gb-r">회사 수익</th>
                  <th scope="col" className="gb-r">전환율</th>
                  <th scope="col">정산</th>
                  <th scope="col">재진행</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const st = STATUS_STYLE[r.status];
                  const cv = conversionRate(r);
                  return (
                    <tr key={r.id}>
                      <td className="a-nowrap a-sub">{period(r)}</td>
                      <td>
                        <a className="a-name" href={`/admin/groupbuys/${r.id}`}>{r.brand}</a>
                        <div className="a-sub">{r.product}</div>
                      </td>
                      <td>
                        {r.creator}
                        {r.platform && <div className="a-sub">{r.platform}</div>}
                      </td>
                      <td><span className="a-badge" style={{ background: st.bg, color: st.fg }}>{STATUS_LABEL[r.status]}</span></td>
                      <td className="gb-r a-nowrap">{num(r.units)}</td>
                      <td className="gb-r a-nowrap"><b>{won(r.revenue)}</b></td>
                      <td className="gb-r a-nowrap">{won(r.company_profit)}</td>
                      <td className="gb-r a-nowrap">{cv === null ? "–" : `${cv}%`}</td>
                      <td className="a-nowrap">{r.settled ? <span className="a-badge" style={{ background: "#e9f7ee", color: "#11552a" }}>완료</span> : r.status === "done" ? <span className="a-badge" style={{ background: "#fff1e6", color: "#a12a00" }}>대기</span> : "–"}</td>
                      <td className="a-nowrap">{r.rerun ? RERUN_LABEL[r.rerun] : "–"}</td>
                    </tr>
                  );
                })}
                {rows.length === 0 && !error && (
                  <tr>
                    <td colSpan={10} className="a-empty">
                      {all.length === 0 ? "아직 기록이 없어요. '결과 입력'이나 '엑셀 업로드'로 추가해 주세요." : "조건에 맞는 기록이 없어요."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {counted.length > 0 && (
          <section className="gb-tops" aria-label="매출 순위">
            {(["brand", "creator"] as const).map((k) => (
              <div className="a-card a-sec" key={k}>
                <h2>{k === "brand" ? "브랜드별 매출 TOP 5" : "크리에이터별 매출 TOP 5"}</h2>
                <ol className="gb-rank">
                  {topBy(counted, k).map(([name, v]) => (
                    <li key={name}>
                      <a href={qs({ q: name })}>{name}</a>
                      <span className="a-sub">{v.count}건 · {num(v.units)}개</span>
                      <b>{won(v.revenue)}</b>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
