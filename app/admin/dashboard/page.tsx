import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { listAllApplicationsLite, type ApplicationLite } from "@/lib/admin/db";
import { listGroupbuys } from "@/lib/admin/groupbuys";
import { listInsights } from "@/lib/admin/insights";
import { STATUS_LABEL as APP_STATUS, STATUS_STYLE as APP_STYLE, TYPE_LABEL, kst } from "@/lib/admin/format";
import { STATUS_LABEL as GB_STATUS, period, type GroupBuy } from "@/lib/groupbuy";
import type { InsightPost } from "@/lib/insights";
import { delta, kstDate, lastMonths, monthKey, monthLabel, monthLabelLong, todayKst } from "@/lib/admin/stats";
import { C, ChartCard, Columns, Kpi, fmtNum, fmtWon, fmtWonShort } from "@/components/admin/Charts";
import AdminTop from "../AdminTop";
import { listBrandChangeRequests, listReviewQueue } from "@/lib/partners/db";
import type { PartnerBrand, ToProduct } from "@/lib/partners/model";
import { PageHead } from "../SubNav";
import { ADMIN_KIND_LABEL } from "@/lib/admin/nav";

export const dynamic = "force-dynamic";

async function safe<T>(p: Promise<T>, fallback: T): Promise<[T, string]> {
  try {
    return [await p, ""];
  } catch (e) {
    return [fallback, e instanceof Error ? e.message : "불러오지 못했습니다."];
  }
}

export default async function Dashboard() {
  if (!(await isAuthed())) redirect("/login");
  const [[apps, e1], [gbs, e2], [posts, e3], [toQueue], [toBrandReq]] = await Promise.all([
    safe<ApplicationLite[]>(listAllApplicationsLite(), []),
    safe<GroupBuy[]>(listGroupbuys(), []),
    safe<InsightPost[]>(listInsights(), []),
    safe<ToProduct[]>(listReviewQueue(), []),
    safe<PartnerBrand[]>(listBrandChangeRequests(), []),
  ]);
  const toWaiting = toQueue.length + toBrandReq.length;
  const errors = [e1, e2, e3].filter(Boolean);

  const today = todayKst();
  const thisM = today.slice(0, 7);
  const [prevM] = lastMonths(2);
  const gbLive = gbs.filter((g) => g.status !== "canceled");
  const gbMonth = (g: GroupBuy) => (g.start_date ?? kstDate(g.created_at)).slice(0, 7);
  const appsIn = (m: string) => apps.filter((a) => monthKey(a.created_at) === m);
  const gbIn = (m: string) => gbLive.filter((g) => gbMonth(g) === m);
  const sumRev = (l: GroupBuy[]) => l.reduce((s, g) => s + (g.revenue ?? 0), 0);
  const sumProfit = (l: GroupBuy[]) => l.reduce((s, g) => s + (g.company_profit ?? 0), 0);
  const pubIn = (m: string) => posts.filter((p) => p.status === "published" && p.post_date.slice(0, 7) === m).length;

  const newApps = apps.filter((a) => a.status === "new");
  const unsettled = gbs.filter((g) => g.status === "done" && !g.settled);
  const todayPosts = (["trends", "hot"] as const).map((k) => ({ k, p: posts.find((x) => x.kind === k && x.post_date === today) }));

  const months = lastMonths(12);
  const appTrend = months.map((m) => ({ label: monthLabel(m), values: { v: appsIn(m).length } }));
  const revTrend = months.map((m) => ({ label: monthLabel(m), values: { v: sumRev(gbIn(m)) } }));

  return (
    <>
      <AdminTop current="home" />
      <main className="a-wrap">
        <PageHead title="전체 업무 현황" desc="오늘 처리할 일과 이번 달 비즈니스·콘텐츠 숫자를 한눈에 봅니다." />
        {errors.map((e) => (
          <p key={e} className="a-error" role="alert">{e}</p>
        ))}

        <section className="a-card a-sec db-todo" aria-label="오늘 할 일">
          <h2>오늘 확인할 일</h2>
          <ul>
            <li className={newApps.length ? "is-warn" : ""}>
              <a href="/applications?status=new">
                <b>신규 신청 {fmtNum(newApps.length)}건</b>
                <span>{newApps.length ? `가장 오래된 건 ${kst(newApps[newApps.length - 1].created_at, false)} 접수` : "모두 처리했어요"}</span>
              </a>
            </li>
            <li className={unsettled.length ? "is-warn" : ""}>
              <a href="/groupbuys?unsettled=1">
                <b>정산 대기 공동구매 {fmtNum(unsettled.length)}건</b>
                <span>{unsettled.length ? `크리에이터 정산 ${fmtWon(unsettled.reduce((s, g) => s + (g.creator_payout ?? 0), 0))}` : "밀린 정산이 없어요"}</span>
              </a>
            </li>
            <li className={toWaiting ? "is-warn" : ""}>
              <a href="/to/review">
                <b>티오 승인 대기 {fmtNum(toWaiting)}건</b>
                <span>{toWaiting ? `새 제품 ${toQueue.filter((p) => p.status === "pending").length} · 수정·삭제 ${toQueue.filter((p) => p.status !== "pending").length} · 브랜드 ${toBrandReq.length}` : "브랜드 요청을 모두 처리했어요"}</span>
              </a>
            </li>
            {todayPosts.map(({ k, p }) => (
              <li key={k} className={p?.status === "draft" ? "is-warn" : ""}>
                <a href={p ? `/insights/${p.id}` : `/insights?kind=${k}`}>
                  <b>오늘 {ADMIN_KIND_LABEL[k]} · {p ? (p.status === "published" ? "게시됨" : "검토 대기") : "초안 없음"}</b>
                  <span>{p ? p.title : "평일 아침에 자동으로 만들어져요"}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="db-kpis">
          <Kpi label="이번 달 제휴 신청" value={`${fmtNum(appsIn(thisM).length)}건`} delta={delta(appsIn(thisM).length, appsIn(prevM).length)} sub={`지난달 ${fmtNum(appsIn(prevM).length)}건`} href="/dashboard/applications" />
          <Kpi label="이번 달 진행 확정" value={`${fmtNum(appsIn(thisM).filter((a) => a.status === "done").length)}건`} sub="이번 달 접수 중" />
          <Kpi label="이번 달 공구 매출" value={fmtWon(sumRev(gbIn(thisM)))} delta={delta(sumRev(gbIn(thisM)), sumRev(gbIn(prevM)))} sub={`${fmtNum(gbIn(thisM).length)}건`} href="/dashboard/groupbuys" />
          <Kpi label="이번 달 회사 수익" value={fmtWon(sumProfit(gbIn(thisM)))} delta={delta(sumProfit(gbIn(thisM)), sumProfit(gbIn(prevM)))} />
          <Kpi label="이번 달 콘텐츠 게시" value={`${fmtNum(pubIn(thisM))}건`} sub={`지난달 ${fmtNum(pubIn(prevM))}건 · 업계 동향+핫 콘텐츠`} href="/insights?kind=trends" />
          <Kpi label="누적" value={`신청 ${fmtNum(apps.length)} · 공구 ${fmtNum(gbLive.length)}`} sub={`공구 누적 매출 ${fmtWonShort(sumRev(gbLive))}원`} />
        </section>

        <div className="db-grid">
          <ChartCard title="월별 신청 수 (최근 12개월)" table={{ head: ["월", "신청"], rows: months.map((m, i) => [monthLabelLong(m), appTrend[i].values.v]) }}>
            <Columns data={appTrend} series={[{ key: "v", label: "신청", color: C.blue }]} format={fmtNum} />
          </ChartCard>
          <ChartCard title="월별 공동구매 매출 (최근 12개월)" table={{ head: ["월", "매출"], rows: months.map((m, i) => [monthLabelLong(m), fmtWon(revTrend[i].values.v)]) }}>
            <Columns data={revTrend} series={[{ key: "v", label: "매출", color: C.orange }]} format={fmtWonShort} />
          </ChartCard>

          <section className="a-card a-sec">
            <h2>최근 제휴 신청</h2>
            <ul className="db-recent">
              {apps.slice(0, 6).map((a) => {
                const s = APP_STYLE[a.status as keyof typeof APP_STYLE];
                return (
                  <li key={a.id}>
                    <a href={`/applications/${a.id}`}>
                      <b>{a.company || a.name}</b>
                      <span className="a-sub">
                        {TYPE_LABEL[a.type as keyof typeof TYPE_LABEL]} · {kst(a.created_at, false)}
                      </span>
                    </a>
                    {s && <span className="a-badge" style={{ background: s.bg, color: s.fg }}>{APP_STATUS[a.status as keyof typeof APP_STATUS]}</span>}
                  </li>
                );
              })}
              {apps.length === 0 && <li className="a-sub">아직 신청이 없어요.</li>}
            </ul>
            <a className="a-sub" href="/applications">제휴 신청 목록 보기 →</a>
          </section>
          <section className="a-card a-sec">
            <h2>최근 공동구매</h2>
            <ul className="db-recent">
              {gbs.slice(0, 6).map((g) => (
                <li key={g.id}>
                  <a href={`/groupbuys/${g.id}`}>
                    <b>{g.brand} · {g.creator}</b>
                    <span className="a-sub">{period(g)} · {GB_STATUS[g.status]}</span>
                  </a>
                  <span className="db-recent-val">{g.revenue !== null ? fmtWon(g.revenue) : "–"}</span>
                </li>
              ))}
              {gbs.length === 0 && <li className="a-sub">아직 공동구매 기록이 없어요.</li>}
            </ul>
            <a className="a-sub" href="/groupbuys">공동구매 목록 보기 →</a>
          </section>
        </div>
      </main>
    </>
  );
}
