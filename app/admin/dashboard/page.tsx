import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { listAllApplicationsLite, type ApplicationLite } from "@/lib/admin/db";
import { listGroupbuys } from "@/lib/admin/groupbuys";
import { listInsights } from "@/lib/admin/insights";
import { STATUS_LABEL as APP_STATUS, STATUS_STYLE as APP_STYLE, TYPE_LABEL, kst } from "@/lib/admin/format";
import { STATUS_LABEL as GB_STATUS, period, type GroupBuy } from "@/lib/groupbuy";
import type { InsightPost } from "@/lib/insights";
import { delta, kstDate, lastMonths, monthKey, monthLabel, monthLabelLong, todayKst } from "@/lib/admin/stats";
import { C, ChartCard, Columns, HBars, Kpi, fmtNum, fmtWon, fmtWonShort } from "@/components/admin/Charts";
import { listBrandChangeRequests, listBrands, listEvents, listProducts, listPromoRequests, listReviewQueue, listUsers, type PartnerEvent } from "@/lib/partners/db";
import { CATEGORIES, type PartnerBrand, type PartnerUser, type PromoRequest, type ToProduct } from "@/lib/partners/model";
import { eventLabel } from "../to/events";
import AdminTop from "../AdminTop";
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

// 승인 처리로 셀 작업 (관리자가 처리한 것)
const DECISIONS = new Set(["product_approved", "change_approved", "delete_approved", "rejected", "brand_change_approved", "brand_change_rejected", "visibility_approved", "visibility_rejected", "promo_request_approved", "promo_request_rejected"]);
// 브랜드 담당자가 올린 요청
const REQUESTS = new Set(["product_submitted", "product_resubmitted", "change_requested", "delete_requested", "brand_change_requested", "visibility_requested_show", "visibility_requested_hide", "promo_requested"]);

function GroupHead({ title, desc, links }: { title: string; desc: string; links: { href: string; label: string }[] }) {
  return (
    <div className="db-group-head">
      <div>
        <h2>{title}</h2>
        <p className="a-sub">{desc}</p>
      </div>
      <nav className="db-group-links" aria-label={`${title} 바로가기`}>
        {links.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </nav>
    </div>
  );
}

export default async function Dashboard() {
  if (!(await isAuthed())) redirect("/login");
  const [[apps, e1], [gbs, e2], [posts, e3], [toQueue, e4], [toBrandReq], [brands], [products], [users], [events], [promoReqs]] = await Promise.all([
    safe<ApplicationLite[]>(listAllApplicationsLite(), []),
    safe<GroupBuy[]>(listGroupbuys(), []),
    safe<InsightPost[]>(listInsights(), []),
    safe<ToProduct[]>(listReviewQueue(), []),
    safe<PartnerBrand[]>(listBrandChangeRequests(), []),
    safe<PartnerBrand[]>(listBrands(), []),
    safe<ToProduct[]>(listProducts(), []),
    safe<PartnerUser[]>(listUsers(), []),
    safe<PartnerEvent[]>(listEvents({ limit: 500 }), []),
    safe<PromoRequest[]>(listPromoRequests({ status: "pending" }), []),
  ]);
  const errors = [e1, e2, e3, e4].filter(Boolean);

  const today = todayKst();
  const thisM = today.slice(0, 7);
  const [prevM] = lastMonths(2);
  const months = lastMonths(12);

  // ---------- 비즈니스 ----------
  const gbLive = gbs.filter((g) => g.status !== "canceled");
  const gbMonth = (g: GroupBuy) => (g.start_date ?? kstDate(g.created_at)).slice(0, 7);
  const appsIn = (m: string) => apps.filter((a) => monthKey(a.created_at) === m);
  const gbIn = (m: string) => gbLive.filter((g) => gbMonth(g) === m);
  const sumRev = (l: GroupBuy[]) => l.reduce((s, g) => s + (g.revenue ?? 0), 0);
  const sumProfit = (l: GroupBuy[]) => l.reduce((s, g) => s + (g.company_profit ?? 0), 0);
  const newApps = apps.filter((a) => a.status === "new");
  const unsettled = gbs.filter((g) => g.status === "done" && !g.settled);
  const appTrend = months.map((m) => ({ label: monthLabel(m), values: { v: appsIn(m).length } }));
  const revTrend = months.map((m) => ({ label: monthLabel(m), values: { v: sumRev(gbIn(m)) } }));

  // ---------- 티오 파트너스 ----------
  const toBrandInfo = toBrandReq.filter((b) => b.pending_changes).length;
  const toBrandVis = toBrandReq.filter((b) => b.visibility_request).length;
  const toWaiting = toQueue.length + toBrandInfo + toBrandVis;
  const activeBrands = brands.filter((b) => b.active);
  const activeIds = new Set(activeBrands.map((b) => b.id));
  const live = products.filter((p) => p.status === "approved" && activeIds.has(p.brand_id));
  const livePicks = live.filter((p) => p.pick_week).length;
  const liveHots = live.filter((p) => p.hot_deal && (!p.hot_until || p.hot_until >= today)).length;
  const brandAccounts = new Set(users.filter((u) => u.role === "brand" && u.active).map((u) => u.brand_id));
  const withAccount = activeBrands.filter((b) => brandAccounts.has(b.id)).length;
  const evIn = (m: string, set: Set<string>) => events.filter((e) => set.has(e.action) && monthKey(e.created_at) === m).length;
  const brandName = new Map(brands.map((b) => [b.id, b.name_ko]));
  const byCategory = CATEGORIES.map((c) => {
    const ids = new Set(activeBrands.filter((b) => b.category === c.key).map((b) => b.id));
    return { label: c.label, value: live.filter((p) => ids.has(p.brand_id)).length, href: `/to/products?category=${c.key}&status=approved` };
  });
  const partnerActivity = events.filter((e) => REQUESTS.has(e.action) || DECISIONS.has(e.action) || e.action.startsWith("account_")).slice(0, 7);

  // ---------- 콘텐츠 ----------
  const pubIn = (m: string) => posts.filter((p) => p.status === "published" && p.post_date.slice(0, 7) === m).length;
  const todayPosts = (["trends", "hot"] as const).map((k) => ({ k, p: posts.find((x) => x.kind === k && x.post_date === today) }));
  const drafts = posts.filter((p) => p.status === "draft").length;
  const recentPosts = posts.filter((p) => p.status === "published").slice(0, 5);

  return (
    <>
      <AdminTop current="home" />
      <main className="a-wrap">
        <PageHead title="전체 업무 현황" desc="오늘 처리할 일과 비즈니스 · 티오 파트너스 · 콘텐츠 숫자를 한눈에 봅니다." />
        {errors.map((e) => (
          <p key={e} className="a-error" role="alert">{e}</p>
        ))}

        <section className="a-card a-sec db-todo" aria-label="오늘 할 일">
          <h2>오늘 확인할 일</h2>
          <ul>
            <li className={newApps.length ? "is-warn" : ""}>
              <a href="/applications?status=new">
                <b>신규 제휴 신청 {fmtNum(newApps.length)}건</b>
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
                <span>{toWaiting ? `새 제품 ${toQueue.filter((p) => p.status === "pending").length} · 수정·삭제 ${toQueue.filter((p) => p.status !== "pending").length} · 브랜드 정보 ${toBrandInfo} · 노출 신청 ${toBrandVis}` : "브랜드 요청을 모두 처리했어요"}</span>
              </a>
            </li>
            <li className={promoReqs.length ? "is-warn" : ""}>
              <a href="/to/promo">
                <b>추천·핫딜 신청 {fmtNum(promoReqs.length)}건</b>
                <span>{promoReqs.length ? "브랜드가 신청한 이번 주 추천·핫딜을 확인해 주세요" : "확인할 신청이 없어요"}</span>
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

        {/* ---------- 비즈니스 ---------- */}
        <section className="db-group" aria-label="비즈니스">
          <GroupHead
            title="비즈니스"
            desc="제휴 신청과 공동구매 — 이번 달과 지난달 비교"
            links={[
              { href: "/dashboard/applications", label: "제휴 신청 현황" },
              { href: "/dashboard/groupbuys", label: "공동구매 현황" },
            ]}
          />
          <div className="db-kpis is-4">
            <Kpi label="이번 달 제휴 신청" value={`${fmtNum(appsIn(thisM).length)}건`} delta={delta(appsIn(thisM).length, appsIn(prevM).length)} sub={`지난달 ${fmtNum(appsIn(prevM).length)}건`} href="/dashboard/applications" />
            <Kpi label="이번 달 진행 확정" value={`${fmtNum(appsIn(thisM).filter((a) => a.status === "done").length)}건`} sub={`누적 신청 ${fmtNum(apps.length)}건`} href="/applications?status=done" />
            <Kpi label="이번 달 공구 매출" value={fmtWon(sumRev(gbIn(thisM)))} delta={delta(sumRev(gbIn(thisM)), sumRev(gbIn(prevM)))} sub={`${fmtNum(gbIn(thisM).length)}건 · 누적 ${fmtWonShort(sumRev(gbLive))}원`} href="/dashboard/groupbuys" />
            <Kpi label="이번 달 회사 수익" value={fmtWon(sumProfit(gbIn(thisM)))} delta={delta(sumProfit(gbIn(thisM)), sumProfit(gbIn(prevM)))} sub={`지난달 ${fmtWon(sumProfit(gbIn(prevM)))}`} />
          </div>
          <div className="db-grid">
            <ChartCard title="월별 제휴 신청 (최근 12개월)" table={{ head: ["월", "신청"], rows: months.map((m, i) => [monthLabelLong(m), appTrend[i].values.v]) }}>
              <Columns data={appTrend} series={[{ key: "v", label: "신청", color: C.blue }]} format={fmtNum} />
            </ChartCard>
            <ChartCard title="월별 공동구매 매출 (최근 12개월)" table={{ head: ["월", "매출"], rows: months.map((m, i) => [monthLabelLong(m), fmtWon(revTrend[i].values.v)]) }}>
              <Columns data={revTrend} series={[{ key: "v", label: "매출", color: C.orange }]} format={fmtWonShort} />
            </ChartCard>
            <section className="a-card a-sec">
              <h2>최근 제휴 신청</h2>
              <ul className="db-recent">
                {apps.slice(0, 5).map((a) => {
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
                {gbs.slice(0, 5).map((g) => (
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
        </section>

        {/* ---------- 티오 파트너스 ---------- */}
        <section className="db-group" aria-label="티오 파트너스">
          <GroupHead
            title="티오 파트너스"
            desc="브랜드가 올린 대여·협찬 제품과 승인 처리"
            links={[
              { href: "/to", label: "티오 현황" },
              { href: "/to/review", label: "승인 대기" },
              { href: "/to/catalog", label: "제품 리스트" },
              { href: "/to/promo", label: "추천·핫딜" },
            ]}
          />
          <div className="db-kpis">
            <Kpi label="게시 중 제품" value={`${fmtNum(live.length)}개`} sub={`협찬 ${fmtNum(live.filter((p) => p.sponsor).length)} · 대여 ${fmtNum(live.filter((p) => p.rental).length)}`} href="/to/products?status=approved" />
            <Kpi label="협업 브랜드" value={`${fmtNum(activeBrands.length)}곳`} sub={`담당자 계정 발급 ${fmtNum(withAccount)}곳`} href="/to/brands" />
            <Kpi
              label="계정 미발급 브랜드"
              value={`${fmtNum(activeBrands.length - withAccount)}곳`}
              sub="발급해야 브랜드가 직접 관리해요"
              href="/to/brands?account=none"
              tone={activeBrands.length - withAccount ? "warn" : undefined}
            />
            <Kpi label="이번 달 브랜드 요청" value={`${fmtNum(evIn(thisM, REQUESTS))}건`} delta={delta(evIn(thisM, REQUESTS), evIn(prevM, REQUESTS))} sub={`승인·반려 처리 ${fmtNum(evIn(thisM, DECISIONS))}건`} href="/settings/log" />
            <Kpi label="이번 달 TO 신청" value={`${fmtNum(appsIn(thisM).filter((a) => a.type === "to").length)}건`} sub="to.vigtiger.com 상담신청" href="/applications?type=to" />
            <Kpi
              label="to 사이트 노출"
              value={`추천 ${fmtNum(livePicks)} · 핫딜 ${fmtNum(liveHots)}`}
              sub={livePicks ? "추천·핫딜 관리하기" : "이번 주 추천이 비어 있어요"}
              href="/to/promo"
              tone={livePicks ? undefined : "warn"}
            />
          </div>
          <div className="db-grid">
            <ChartCard title="분류별 게시 중 제품" table={{ head: ["분류", "제품"], rows: byCategory.map((r) => [r.label, r.value]) }}>
              <HBars rows={byCategory} color={C.aqua} format={(n) => `${fmtNum(n)}개`} />
            </ChartCard>
            <section className="a-card a-sec">
              <h2>최근 파트너 활동</h2>
              <ul className="db-recent">
                {partnerActivity.map((e) => (
                  <li key={e.id}>
                    <a href={e.product_id ? `/to/products/${e.product_id}` : e.brand_id ? `/to/brands/${e.brand_id}` : "/settings/log"}>
                      <b>
                        {eventLabel(e.action)}
                        {e.brand_id && brandName.get(e.brand_id) ? ` · ${brandName.get(e.brand_id)}` : ""}
                      </b>
                      <span className="a-sub">
                        {e.actor_label ?? "–"} · {kst(e.created_at, false)}
                        {typeof e.detail?.name === "string" ? ` · ${e.detail.name}` : ""}
                      </span>
                    </a>
                  </li>
                ))}
                {partnerActivity.length === 0 && <li className="a-sub">아직 브랜드 활동이 없어요. 담당자 계정을 발급하면 여기에 쌓여요.</li>}
              </ul>
              <a className="a-sub" href="/settings/log">작업 기록 전체 보기 →</a>
            </section>
          </div>
        </section>

        {/* ---------- 콘텐츠 ---------- */}
        <section className="db-group" aria-label="콘텐츠">
          <GroupHead
            title="콘텐츠"
            desc="인사이트(업계 동향 · 핫 콘텐츠) 게시 현황"
            links={[
              { href: "/insights?kind=trends", label: "업계 동향" },
              { href: "/insights?kind=hot", label: "핫 콘텐츠" },
            ]}
          />
          <div className="db-grid">
            <div className="db-kpis is-2">
              <Kpi label="이번 달 게시" value={`${fmtNum(pubIn(thisM))}건`} delta={delta(pubIn(thisM), pubIn(prevM))} sub={`지난달 ${fmtNum(pubIn(prevM))}건`} href="/insights?kind=trends" />
              <Kpi label="검토 대기 초안" value={`${fmtNum(drafts)}건`} sub="09:30까지 검토 안 하면 자동 게시" tone={drafts ? "warn" : undefined} href="/insights?kind=trends" />
            </div>
            <section className="a-card a-sec">
              <h2>최근 게시 글</h2>
              <ul className="db-recent">
                {recentPosts.map((p) => (
                  <li key={p.id}>
                    <a href={`/insights/${p.id}`}>
                      <b>{p.title}</b>
                      <span className="a-sub">{ADMIN_KIND_LABEL[p.kind]} · {p.post_date}</span>
                    </a>
                  </li>
                ))}
                {recentPosts.length === 0 && <li className="a-sub">아직 게시한 글이 없어요.</li>}
              </ul>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
