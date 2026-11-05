import "server-only";

// 인사이트 — 공개 페이지용 조회
//  · trends: 업계 동향 (인플루언서 마케팅 기사 정리)
//  · hot:    Hot Contents (전날 화제가 된 소셜 미디어 콘텐츠 추천)
// 공개(publishable) 키로 읽기 때문에 RLS에 따라 '게시된 글'만 보입니다.

export type InsightKind = "trends" | "hot";
export const INSIGHT_KINDS: InsightKind[] = ["trends", "hot"];
export const isKind = (k: string): k is InsightKind => k === "trends" || k === "hot";

export const KIND_META: Record<
  InsightKind,
  { label: string; path: string; eyebrow: string; title: string[]; lead: string; metaTitle: string; metaDesc: string; unit: string }
> = {
  trends: {
    label: "업계 동향",
    path: "/insights/trends",
    eyebrow: "INSIGHTS · 업계 동향",
    title: ["인플루언서 마케팅,", "오늘의 흐름"],
    lead: "국내외 인플루언서·크리에이터 마케팅 소식을 매일 골라 핵심만 정리합니다. 원문은 각 기사 링크에서 확인하세요.",
    metaTitle: "업계 동향 — 오늘의 인플루언서 마케팅",
    metaDesc: "국내외 인플루언서·크리에이터 마케팅 소식을 매일 골라 핵심만 정리합니다. 대범한사람들 인사이트.",
    unit: "기사",
  },
  hot: {
    label: "Hot Contents",
    path: "/insights/hot",
    eyebrow: "INSIGHTS · HOT CONTENTS",
    title: ["어제 가장 뜨거웠던", "소셜 콘텐츠"],
    lead: "유튜브·인스타그램·틱톡·X에서 어제 화제가 된 콘텐츠를 골라, 왜 떴는지와 브랜드·크리에이터가 참고할 포인트를 정리합니다.",
    metaTitle: "Hot Contents — 어제의 화제 소셜 콘텐츠",
    metaDesc: "어제 화제가 된 소셜 미디어 콘텐츠와 그 이유, 마케팅 활용 포인트를 매일 정리합니다. 대범한사람들 인사이트.",
    unit: "콘텐츠",
  },
};

export type InsightItem = {
  title: string;
  source: string; // 업계 동향: 언론사 / Hot: 소개한 곳(언론사·플랫폼)
  url: string; // 업계 동향: 기사 원문 / Hot: 콘텐츠 원본(게시물) 링크
  published?: string; // YYYY-MM-DD
  region: "국내" | "해외";
  summary: string; // Hot: 왜 떴나
  // Hot Contents 전용 (선택)
  platform?: string; // YouTube · Instagram · TikTok · X · 기타
  creator?: string; // 채널·계정 이름
  metric?: string; // 확인된 반응 (예: "공개 하루 만에 조회수 300만 회")
  point?: string; // 마케팅 활용 포인트
  articleUrl?: string; // 관련 기사 링크
};

export type InsightPost = {
  id: string;
  kind: InsightKind;
  slug: string;
  post_date: string;
  title: string;
  intro: string | null;
  takeaway: string | null;
  items: InsightItem[];
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export const INSIGHTS_REVALIDATE = 300;

function pub() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}` } };
}

/** http(s) 링크만 허용 */
export const safeUrl = (u: string) => {
  try {
    const x = new URL(u);
    return x.protocol === "https:" || x.protocol === "http:" ? x.toString() : null;
  } catch {
    return null;
  }
};

export const isSlug = (s: string) => /^\d{4}-\d{2}-\d{2}(-\d+)?$/.test(s);

export async function listPublishedInsights(kind?: InsightKind, limit = 60): Promise<InsightPost[]> {
  const c = pub();
  if (!c) return [];
  const k = kind ? `&kind=eq.${kind}` : "";
  try {
    const res = await fetch(
      `${c.url}/rest/v1/insight_posts?status=eq.published${k}&select=*&order=post_date.desc,published_at.desc&limit=${limit}`,
      { headers: c.headers, next: { revalidate: INSIGHTS_REVALIDATE } },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return []; // DB에 닿지 못해도 페이지는 빈 목록으로 열리게
  }
}

export async function getPublishedInsight(kind: InsightKind, slug: string): Promise<InsightPost | null> {
  if (!isSlug(slug)) return null;
  const c = pub();
  if (!c) return null;
  try {
    const res = await fetch(`${c.url}/rest/v1/insight_posts?status=eq.published&kind=eq.${kind}&slug=eq.${slug}&select=*&limit=1`, {
      headers: c.headers,
      next: { revalidate: INSIGHTS_REVALIDATE },
    });
    if (!res.ok) return null;
    const rows: InsightPost[] = await res.json();
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export function formatKoDate(d: string) {
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  const w = ["일", "월", "화", "수", "목", "금", "토"][new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
  return `${y}년 ${m}월 ${day}일 (${w})`;
}

export const postPath = (p: Pick<InsightPost, "kind" | "slug">) => `${KIND_META[p.kind].path}/${p.slug}`;
