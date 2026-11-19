import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { listAllApplicationsLite, type ApplicationLite } from "@/lib/admin/db";
import { STATUS_LABEL, TYPE_LABEL } from "@/lib/admin/format";
import { countBy, delta, inRange, kstDate, lastMonths, monthKey, monthLabel, monthLabelLong, optionLabel, optionOrder, parseRange, rangeBounds, RANGES } from "@/lib/admin/stats";
import { C, ChartCard, Columns, Funnel, HBars, Kpi, Split, fmtNum } from "@/components/admin/Charts";
import AdminTop from "../../AdminTop";
import { RangeTabs, SectionHeader } from "../../SubNav";

export const dynamic = "force-dynamic";

const TYPES = ["creator", "advertiser", "partner"] as const;
const TYPE_COLOR = { creator: C.blue, advertiser: C.orange, partner: C.aqua };

const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : typeof v === "string" && v ? [v] : []);

export default async function ApplicationsDashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  if (!(await isAuthed())) redirect("/login");
  const range = parseRange((await searchParams).range);
  const rLabel = RANGES.find((r) => r.key === range)!.label;
  let all: ApplicationLite[] = [];
  let error = "";
  try {
    all = await listAllApplicationsLite();
  } catch (e) {
    error = e instanceof Error ? e.message : "불러오지 못했습니다.";
  }
  const b = rangeBounds(range);
  const day = (a: ApplicationLite) => kstDate(a.created_at);
  const rows = all.filter((a) => inRange(day(a), b.start, b.end));
  const prev = b.prevStart ? all.filter((a) => inRange(day(a), b.prevStart!, b.prevEnd!)) : null;

  const done = rows.filter((a) => a.status === "done").length;
  const decided = rows.filter((a) => a.status !== "new").length;
  const pendingNew = all.filter((a) => a.status === "new").length;
  const byType = (list: ApplicationLite[], t: string) => list.filter((a) => a.type === t).length;

  // 월별 추이 (최근 12개월, 유형별 누적)
  const months = lastMonths(12);
  const trend = months.map((m) => ({
    label: monthLabel(m),
    values: Object.fromEntries(TYPES.map((t) => [t, all.filter((a) => a.type === t && monthKey(a.created_at) === m).length])),
  }));

  // 처리 단계 (현재 상태 기준)
  const st = (s: string[]) => rows.filter((a) => s.includes(a.status)).length;
  const funnel = [
    { label: "접수", value: rows.length },
    { label: "검토 시작", value: st(["in_review", "contacted", "done"]), note: "검토 중·연락함·진행 확정" },
    { label: "연락함", value: st(["contacted", "done"]), note: "연락함·진행 확정" },
    { label: "진행 확정", value: st(["done"]) },
  ];

  const creators = rows.filter((a) => a.type === "creator");
  const advertisers = rows.filter((a) => a.type === "advertiser");
  const partners = rows.filter((a) => a.type === "partner");
  const optRows = (list: ApplicationLite[], type: "creator" | "advertiser" | "partner", key: string, multi = false) => {
    const counts = new Map(countBy(list, (a) => (multi ? arr(a.details?.[key]) : (a.details?.[key] as string) || null)));
    const order = optionOrder(type, key);
    return order.map((v) => ({ label: optionLabel(type, key, v), value: counts.get(v) ?? 0 }));
  };
  const products = countBy(creators, (a) =>
    String(a.details?.interestProducts ?? "")
      .split(/[,，、/]/)
      .map((s) => s.trim())
      .filter(Boolean),
  ).map(([label, value]) => ({ label, value }));

  return (
    <>
      <AdminTop current="applications" />
      <main className="a-wrap">
        <SectionHeader section="applications" current="dashboard" actions={<RangeTabs base="/dashboard/applications" current={range} />} />
        {error && <p className="a-error" role="alert">{error}</p>}

        <section className="db-kpis">
          <Kpi label={`신청 (${rLabel})`} value={`${fmtNum(rows.length)}건`} delta={prev ? delta(rows.length, prev.length) : undefined} sub={prev ? `이전 같은 기간 ${fmtNum(prev.length)}건` : undefined} />
          <Kpi label="크리에이터" value={`${fmtNum(byType(rows, "creator"))}건`} delta={prev ? delta(byType(rows, "creator"), byType(prev, "creator")) : undefined} />
          <Kpi label="광고주" value={`${fmtNum(byType(rows, "advertiser"))}건`} delta={prev ? delta(byType(rows, "advertiser"), byType(prev, "advertiser")) : undefined} />
          <Kpi label="상품 파트너" value={`${fmtNum(byType(rows, "partner"))}건`} delta={prev ? delta(byType(rows, "partner"), byType(prev, "partner")) : undefined} />
          <Kpi label="진행 확정률" value={rows.length ? `${Math.round((done / rows.length) * 100)}%` : "–"} sub={`확정 ${fmtNum(done)}건 · 처리 ${fmtNum(decided)}건`} />
          <Kpi label="아직 신규 상태 (전체)" value={`${fmtNum(pendingNew)}건`} href="/applications?status=new" tone={pendingNew ? "warn" : undefined} sub="눌러서 처리하기" />
        </section>

        <div className="db-grid">
          <ChartCard
            wide
            title="월별 신청 추이 (최근 12개월)"
            note="막대에 마우스를 올리면 유형별 건수가 보여요."
            table={{ head: ["월", "크리에이터", "광고주", "상품 파트너", "합계"], rows: months.map((m, i) => [monthLabelLong(m), ...TYPES.map((t) => trend[i].values[t]), TYPES.reduce((s, t) => s + trend[i].values[t], 0)]) }}
          >
            <Columns wide height={220} data={trend} series={TYPES.map((t) => ({ key: t, label: TYPE_LABEL[t], color: TYPE_COLOR[t] }))} format={fmtNum} />
          </ChartCard>

          <ChartCard title={`유형별 비중 · ${rLabel}`}>
            <Split parts={TYPES.map((t) => ({ label: TYPE_LABEL[t], value: byType(rows, t), color: TYPE_COLOR[t] }))} format={(n) => `${fmtNum(n)}건`} />
            <Split parts={[{ label: "한국어 신청", value: rows.filter((a) => a.lang !== "en").length, color: C.blue }, { label: "영문 신청", value: rows.filter((a) => a.lang === "en").length, color: C.orange }]} format={(n) => `${fmtNum(n)}건`} />
          </ChartCard>

          <ChartCard title={`처리 단계 · ${rLabel}`} note="지금 상태 기준으로, 각 단계 이상까지 간 신청 수예요.">
            <Funnel steps={funnel} />
            <p className="a-sub">보류·종료 {fmtNum(st(["rejected"]))}건 · 신규(미처리) {fmtNum(st(["new"]))}건</p>
          </ChartCard>

          <ChartCard title="현재 처리 상태" table={{ head: ["상태", "건수"], rows: (["new", "in_review", "contacted", "done", "rejected"] as const).map((s) => [STATUS_LABEL[s], st([s])]) }}>
            <HBars rows={(["new", "in_review", "contacted", "done", "rejected"] as const).map((s) => ({ label: STATUS_LABEL[s], value: st([s]), href: `/applications?status=${s}` }))} format={(n) => `${fmtNum(n)}건`} />
          </ChartCard>

          <ChartCard title="크리에이터 · 관심 있는 서비스" note="여러 개 고를 수 있어 합계가 신청 수보다 많을 수 있어요.">
            <HBars rows={optRows(creators, "creator", "interests", true)} format={(n) => `${fmtNum(n)}건`} />
          </ChartCard>
          <ChartCard title="크리에이터 · 구독자 규모">
            <HBars rows={optRows(creators, "creator", "subscribers")} format={(n) => `${fmtNum(n)}건`} />
          </ChartCard>
          <ChartCard title="크리에이터 · 채널 카테고리">
            <HBars rows={optRows(creators, "creator", "category").sort((a, b) => b.value - a.value)} format={(n) => `${fmtNum(n)}건`} />
          </ChartCard>
          <ChartCard title="크리에이터 · 관심 있는 제품" note="쉼표로 나눠 센 값이에요.">
            <HBars rows={products} format={(n) => `${fmtNum(n)}건`} showShare={false} />
          </ChartCard>
          <ChartCard title="광고주 · 예산 규모">
            <HBars rows={optRows(advertisers, "advertiser", "budget")} color={C.orange} format={(n) => `${fmtNum(n)}건`} />
          </ChartCard>
          <ChartCard title="광고주·상품 파트너 · 제품 카테고리">
            <HBars
              rows={(() => {
                const m = new Map<string, number>();
                for (const [list, t] of [[advertisers, "advertiser"], [partners, "partner"]] as const)
                  for (const r of optRows(list, t, "category")) m.set(r.label, (m.get(r.label) ?? 0) + r.value);
                return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
              })()}
              color={C.orange}
              format={(n) => `${fmtNum(n)}건`}
            />
          </ChartCard>
        </div>
      </main>
    </>
  );
}
