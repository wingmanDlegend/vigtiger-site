import "server-only";
import { cfg } from "./db";

// 관리자 메뉴 정보구조(IA)와 처리할 일 배지
export type NavKey =
  | "home" | "applications" | "groupbuys" | "trends" | "hot"
  | "to-home" | "to-review" | "to-products" | "to-brands" | "to-catalog" | "to-promo"
  | "accounts" | "log" | "password";

export const ADMIN_NAV: { group?: string; items: { key: NavKey; label: string; href: string }[] }[] = [
  { items: [{ key: "home", label: "홈", href: "/" }] },
  {
    group: "비즈니스",
    items: [
      { key: "applications", label: "제휴 신청", href: "/dashboard/applications" },
      { key: "groupbuys", label: "공동구매", href: "/dashboard/groupbuys" },
    ],
  },
  {
    group: "티오 파트너스",
    items: [
      { key: "to-home", label: "현황", href: "/to" },
      { key: "to-review", label: "승인 대기", href: "/to/review" },
      { key: "to-products", label: "제품", href: "/to/products" },
      { key: "to-brands", label: "브랜드·계정", href: "/to/brands" },
      { key: "to-catalog", label: "제품 리스트", href: "/to/catalog" },
      { key: "to-promo", label: "추천·핫딜", href: "/to/promo" },
    ],
  },
  {
    group: "콘텐츠",
    items: [
      { key: "trends", label: "업계 동향", href: "/insights?kind=trends" },
      { key: "hot", label: "핫 콘텐츠", href: "/insights?kind=hot" },
    ],
  },
  {
    group: "설정",
    items: [
      { key: "accounts", label: "직원 계정", href: "/settings/accounts" },
      { key: "log", label: "작업 기록", href: "/settings/log" },
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
    const [applications, groupbuys, trends, hot, toProducts, toBrands, toVis, toPromo] = await Promise.all([
      count("applications?select=id&status=eq.new"),
      count("groupbuys?select=id&status=eq.done&settled=is.false"),
      count("insight_posts?select=id&status=eq.draft&kind=eq.trends"),
      count("insight_posts?select=id&status=eq.draft&kind=eq.hot"),
      count("to_products?select=id&or=(status.eq.pending,pending_changes.not.is.null,delete_requested.is.true)"),
      count("partner_brands?select=id&pending_changes=not.is.null"),
      count("partner_brands?select=id&visibility_request=not.is.null"),
      count("to_promo_requests?select=id&status=eq.pending"),
    ]);
    return { applications, groupbuys, trends, hot, "to-review": toProducts + toBrands + toVis, "to-promo": toPromo };
  } catch {
    return {};
  }
}
