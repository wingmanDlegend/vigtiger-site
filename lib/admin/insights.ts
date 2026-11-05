import "server-only";
import { cfg, isUuid } from "./db";
import type { InsightItem, InsightPost } from "@/lib/insights";

// 관리자용 인사이트 조회·수정 (비밀 키, 초안 포함)

export async function listInsights(): Promise<InsightPost[]> {
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/insight_posts?select=*&order=post_date.desc,created_at.desc&limit=200`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`조회 실패 (${res.status})`);
  return res.json();
}

export async function getInsight(id: string): Promise<InsightPost | null> {
  if (!isUuid(id)) return null;
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/insight_posts?id=eq.${id}&select=*&limit=1`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`조회 실패 (${res.status})`);
  const rows: InsightPost[] = await res.json();
  return rows[0] ?? null;
}

export async function patchInsight(id: string, patch: Partial<InsightPost>) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/insight_posts?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`저장 실패 (${res.status}): ${await res.text()}`);
  const rows: InsightPost[] = await res.json();
  if (!rows[0]) throw new Error("글을 찾을 수 없습니다.");
  return rows[0];
}

export async function deleteInsight(id: string) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/insight_posts?id=eq.${id}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=representation" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
  const rows: unknown[] = await res.json();
  if (rows.length === 0) throw new Error("이미 삭제되었거나 찾을 수 없는 글입니다.");
}

/** 편집 화면에서 온 값을 검증·정리 */
export function cleanItems(raw: unknown): InsightItem[] {
  if (!Array.isArray(raw)) throw new Error("기사 목록 형식이 올바르지 않습니다.");
  if (raw.length > 30) throw new Error("기사는 30건까지 넣을 수 있습니다.");
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  return raw.map((r, i) => {
    const o = (r ?? {}) as Record<string, unknown>;
    const it: InsightItem = {
      title: str(o.title, 300),
      source: str(o.source, 80),
      url: str(o.url, 1000),
      published: /^\d{4}-\d{2}-\d{2}$/.test(str(o.published, 10)) ? str(o.published, 10) : undefined,
      region: o.region === "해외" ? "해외" : "국내",
      summary: str(o.summary, 1500),
    };
    if (!it.title || !it.summary) throw new Error(`${i + 1}번째 기사의 제목과 요약을 채워 주세요.`);
    try {
      const u = new URL(it.url);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw 0;
    } catch {
      throw new Error(`${i + 1}번째 기사의 원문 링크가 올바르지 않습니다.`);
    }
    return it;
  });
}
