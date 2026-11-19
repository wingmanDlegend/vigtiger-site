import "server-only";
import { cfg } from "./db";

// 관리자 메뉴 정보구조(IA)와 처리할 일 배지
export type NavKey = "home" | "applications" | "groupbuys" | "trends" | "hot";

export const ADMIN_NAV: { group?: string; items: { key: NavKey; label: string; href: string }[] }[] = [
  { items: [{ key: "home", label: "홈", href: "/admin/dashboard" }] },
  {
    group: "비즈니스",
    items: [
      { key: "applications", label: "제휴 신청", href: "/admin/dashboard/applications" },
      { key: "groupbuys", label: "공동구매", href: "/admin/dashboard/groupbuys" },
    ],
  },
  {
    group: "콘텐츠",
    items: [
      { key: "trends", label: "업계 동향", href: "/admin/insights?kind=trends" },
      { key: "hot", label: "핫 콘텐츠", href: "/admin/insights?kind=hot" },
    ],
  },
];

export const ADMIN_KIND_LABEL = { trends: "업계 동향", hot: "핫 콘텐츠" } as const;

/** 메뉴 옆 숫자 배지 — 신규 신청 · 정산 대기 · 검토 대기 초안. 실패해도 메뉴는 그대로 보임 */
export async function navBadges(): Promise<Partial<Record<NavKey, number>>> {
  try {
    const { url, headers } = cfg();
    const count = async (path: string) => {
      const res = await fetch(`${url}/rest/v1/${path}`, {
        method: "HEAD",
        headers: { ...headers, Prefer: "count=exact", Range: "0-0", "Range-Unit": "items" },
        cache: "no-store",
      });
      return Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
    };
    const [applications, groupbuys, trends, hot] = await Promise.all([
      count("applications?select=id&status=eq.new"),
      count("groupbuys?select=id&status=eq.done&settled=is.false"),
      count("insight_posts?select=id&status=eq.draft&kind=eq.trends"),
      count("insight_posts?select=id&status=eq.draft&kind=eq.hot"),
    ]);
    return { applications, groupbuys, trends, hot };
  } catch {
    return {};
  }
}
