import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { listGroupbuys } from "@/lib/admin/groupbuys";
import { RERUN_LABEL, STATUS_LABEL, type GroupBuy } from "@/lib/groupbuy";
import { delta, inRange, kstDate, lastMonths, monthLabel, monthLabelLong, parseRange, rangeBounds, RANGES } from "@/lib/admin/stats";
import { C, ChartCard, Columns, HBars, Kpi, Split, fmtNum, fmtWon, fmtWonShort } from "@/components/admin/Charts";
import AdminTop from "../../AdminTop";
import { RangeTabs, SectionTabs } from "../../SubNav";

export const dynamic = "force-dynamic";

const sum = (rows: GroupBuy[], k: "revenue" | "units" | "company_profit" | "creator_payout" | "views" | "clicks") => rows.reduce((n, r) => n + (r[k] ?? 0), 0);
const dayOf = (g: GroupBuy) => g.start_date ?? kstDate(g.created_at);

function groupSum(rows: GroupBuy[], key: (g: GroupBuy) => string, val: (g: GroupBuy) => number) {
  const m = new Map<string, { value: number; count: number }>();
  for (const r of rows) {
    const k = key(r) || "미입력";
    const e = m.get(k) ?? { value: 0, count: 0 };
    e.value += val(r);
    e.count += 1;
    m.set(k, e);
  }
  return [...m.entries()].map(([label, e]) => ({ label, value: e.value, sub: `${e.count}건` })).sort((a, b) => b.value - a.value);
}

export default async function GroupbuyDashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const range = parseRange((await searchParams).range);
  const rLabel = RANGES.find((r) => r.key === range)!.label;
  let all: GroupBuy[] = [];
  let error = "";
  try {
    all = await listGroupbuys();
  } catch (e) {
    error = e instanceof Error ? e.message : "불러오지 못했습니다.";
  }
  const live = all.filter((g) => g.status !== "canceled");
  const b = rangeBounds(range);
  const rows = live.filter((g) => inRange(dayOf(g), b.start, b.end));
  const prev = b.prevStart ? live.filter((g) => inRange(dayOf(g), b.prevStart!, b.prevEnd!)) : null;

  const rev = sum(rows, "revenue");
  const profit = sum(rows, "company_profit");
  const withRev = rows.filter((g) => g.revenue !== null);
  const convRows = rows.filter((g) => g.clicks && g.units !== null);
  const conv = convRows.length ? Math.round((convRows.reduce((s, g) => s + (g.units ?? 0), 0) / convRows.reduce((s, g) => s + (g.clicks ?? 0), 0)) * 1000) / 10 : null;
  const unsettled = all.filter((g) => g.status === "done" && !g.settled);
  const unsettledPay = sum(unsettled, "creator_payout");

  const months = lastMonths(12);
  const byMonth = (k: "revenue" | "company_profit") =>
    months.map((m) => ({ label: monthLabel(m), values: { v: live.filter((g) => dayOf(g).slice(0, 7) === m).reduce((s, g) => s + (g[k] ?? 0), 0) } }));
  const revTrend = byMonth("revenue");
  const profitTrend = byMonth("company_profit");

  return (
    <>
      <AdminTop current="groupbuys" />
      <main className="a-wrap">
        <SectionTabs section="groupbuys" current="dashboard" />
        <div className="a-tools">
          <h1 className="a-h1">공동구매 대시보드</h1>
          <RangeTabs base="/admin/dashboard/groupbuys" current={range} />
        </div>
        <p className="a-sub">시작일 기준으로 집계하고, 취소 건은 제외합니다.</p>
        {error && <p className="a-error" role="alert">{error}</p>}

        <section className="db-kpis">
          <Kpi label={`공동구매 (${rLabel})`} value={`${fmtNum(rows.length)}건`} delta={prev ? delta(rows.length, prev.length) : undefined} />
          <Kpi label="총 매출" value={fmtWon(rev)} delta={prev ? delta(rev, sum(prev, "revenue")) : undefined} />
          <Kpi label="회사 수익" value={fmtWon(profit)} delta={prev ? delta(profit, sum(prev, "company_profit")) : undefined} sub={rev ? `매출 대비 ${Math.round((profit / rev) * 1000) / 10}%` : undefined} />
          <Kpi label="건당 평균 매출" value={withRev.length ? fmtWon(Math.round(sum(withRev, "revenue") / withRev.length)) : "–"} sub={`판매 ${fmtNum(sum(rows, "units"))}개`} />
          <Kpi label="평균 전환율" value={conv === null ? "–" : `${conv}%`} sub={convRows.length ? `판매÷클릭, ${convRows.length}건 기준` : "클릭 수 입력 건 없음"} />
          <Kpi label="정산 대기 (전체)" value={`${fmtNum(unsettled.length)}건`} sub={unsettledPay ? `크리에이터 정산 ${fmtWon(unsettledPay)}` : undefined} href="/admin/groupbuys?unsettled=1" tone={unsettled.length ? "warn" : undefined} />
        </section>

        <div className="db-grid">
          <ChartCard title="월별 매출 (최근 12개월)" table={{ head: ["월", "매출"], rows: months.map((m, i) => [monthLabelLong(m), fmtWon(revTrend[i].values.v)]) }}>
            <Columns data={revTrend} series={[{ key: "v", label: "매출", color: C.orange }]} format={fmtWonShort} />
          </ChartCard>
          <ChartCard title="월별 회사 수익 (최근 12개월)" table={{ head: ["월", "회사 수익"], rows: months.map((m, i) => [monthLabelLong(m), fmtWon(profitTrend[i].values.v)]) }}>
            <Columns data={profitTrend} series={[{ key: "v", label: "회사 수익", color: C.aqua }]} format={fmtWonShort} />
          </ChartCard>

          <ChartCard title={`브랜드별 매출 TOP 10 · ${rLabel}`}>
            <HBars rows={groupSum(rows, (g) => g.brand, (g) => g.revenue ?? 0).map((r) => ({ ...r, href: `/admin/groupbuys?q=${encodeURIComponent(r.label)}` }))} color={C.orange} format={fmtWonShort} />
          </ChartCard>
          <ChartCard title={`크리에이터별 매출 TOP 10 · ${rLabel}`}>
            <HBars rows={groupSum(rows, (g) => g.creator, (g) => g.revenue ?? 0).map((r) => ({ ...r, href: `/admin/groupbuys?q=${encodeURIComponent(r.label)}` }))} color={C.orange} format={fmtWonShort} />
          </ChartCard>
          <ChartCard title={`플랫폼별 매출 · ${rLabel}`}>
            <HBars rows={groupSum(rows, (g) => g.platform ?? "", (g) => g.revenue ?? 0)} color={C.orange} format={fmtWonShort} />
          </ChartCard>
          <ChartCard title={`제품별 판매 수량 TOP 10 · ${rLabel}`}>
            <HBars rows={groupSum(rows, (g) => `${g.brand} ${g.product}`, (g) => g.units ?? 0)} color={C.blue} format={(n) => `${fmtNum(n)}개`} />
          </ChartCard>

          <ChartCard title={`재진행 판단 · ${rLabel}`}>
            <Split
              parts={[
                { label: RERUN_LABEL.recommend, value: rows.filter((g) => g.rerun === "recommend").length, color: C.aqua },
                { label: RERUN_LABEL.hold, value: rows.filter((g) => g.rerun === "hold").length, color: C.blue },
                { label: RERUN_LABEL.no, value: rows.filter((g) => g.rerun === "no").length, color: C.orange },
                { label: "판단 전", value: rows.filter((g) => !g.rerun).length, color: C.gray },
              ]}
              format={(n) => `${fmtNum(n)}건`}
            />
          </ChartCard>
          <ChartCard title={`진행 상태 · 정산 · ${rLabel}`}>
            <Split
              parts={(["planned", "live", "done"] as const).map((s, i) => ({ label: STATUS_LABEL[s], value: rows.filter((g) => g.status === s).length, color: [C.blue, C.orange, C.aqua][i] }))}
              format={(n) => `${fmtNum(n)}건`}
            />
            <Split
              parts={[
                { label: "정산 완료", value: rows.filter((g) => g.status === "done" && g.settled).length, color: C.aqua },
                { label: "정산 대기", value: rows.filter((g) => g.status === "done" && !g.settled).length, color: C.orange },
              ]}
              format={(n) => `${fmtNum(n)}건`}
            />
          </ChartCard>
        </div>
      </main>
    </>
  );
}
