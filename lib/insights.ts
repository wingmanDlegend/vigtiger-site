import "server-only";

// 인사이트(인플루언서 마케팅 데일리 정리) — 공개 페이지용 조회
// 공개(publishable) 키로 읽기 때문에 RLS에 따라 '게시된 글'만 보입니다.

export type InsightItem = {
  title: string;
  source: string;
  url: string;
  published?: string; // YYYY-MM-DD
  region: "국내" | "해외";
  summary: string;
};

export type InsightPost = {
  id: string;
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

export async function listPublishedInsights(limit = 60): Promise<InsightPost[]> {
  const c = pub();
  if (!c) return [];
  try {
    const res = await fetch(
      `${c.url}/rest/v1/insight_posts?status=eq.published&select=*&order=post_date.desc,published_at.desc&limit=${limit}`,
      { headers: c.headers, next: { revalidate: INSIGHTS_REVALIDATE } },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return []; // DB에 닿지 못해도 페이지는 빈 목록으로 열리게
  }
}

export async function getPublishedInsight(slug: string): Promise<InsightPost | null> {
  if (!isSlug(slug)) return null;
  const c = pub();
  if (!c) return null;
  try {
    const res = await fetch(`${c.url}/rest/v1/insight_posts?status=eq.published&slug=eq.${slug}&select=*&limit=1`, {
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
