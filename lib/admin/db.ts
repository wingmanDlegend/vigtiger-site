import "server-only";
import type { FormType } from "@/lib/forms";

// Supabase(PostgREST)를 비밀 키로 직접 호출합니다. 이 파일은 서버에서만 실행됩니다.

export const STATUSES = ["new", "in_review", "contacted", "done", "rejected"] as const;
export type Status = (typeof STATUSES)[number];

export type Application = {
  id: string;
  created_at: string;
  updated_at: string;
  type: FormType;
  lang: "ko" | "en";
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  details: Record<string, string | string[]>;
  message: string | null;
  privacy_agreed: boolean;
  status: Status;
  admin_note: string | null;
};

function cfg() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY 환경변수가 없습니다.");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export type ListQuery = { type?: string; status?: string; q?: string; page?: number; pageSize?: number };

export async function listApplications(qs: ListQuery) {
  const { url, headers } = cfg();
  const pageSize = qs.pageSize ?? 50;
  const page = Math.max(1, qs.page ?? 1);
  const p = new URLSearchParams({ select: "*", order: "created_at.desc" });
  if (qs.type && ["creator", "advertiser", "partner"].includes(qs.type)) p.set("type", `eq.${qs.type}`);
  if (qs.status && (STATUSES as readonly string[]).includes(qs.status)) p.set("status", `eq.${qs.status}`);
  const q = (qs.q ?? "").replace(/[,()*%\\]/g, " ").trim().slice(0, 60);
  if (q) p.set("or", `(name.ilike.*${q}*,company.ilike.*${q}*,email.ilike.*${q}*,phone.ilike.*${q}*)`);
  const from = (page - 1) * pageSize;
  const res = await fetch(`${url}/rest/v1/applications?${p}`, {
    headers: { ...headers, Prefer: "count=exact", Range: `${from}-${from + pageSize - 1}`, "Range-Unit": "items" },
    cache: "no-store",
  });
  if (!res.ok && res.status !== 416) throw new Error(`목록 조회 실패 (${res.status}): ${await res.text()}`);
  const rows: Application[] = res.status === 416 ? [] : await res.json();
  const total = Number(res.headers.get("content-range")?.split("/")[1] ?? rows.length) || 0;
  return { rows, total, page, pageSize };
}

/** 탭에 표시할 유형·상태별 건수 */
export async function countAll() {
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/applications?select=type,status&limit=10000`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`건수 조회 실패 (${res.status})`);
  const rows: { type: string; status: string }[] = await res.json();
  const by = (k: "type" | "status", v: string) => rows.filter((r) => r[k] === v).length;
  return {
    all: rows.length,
    type: { creator: by("type", "creator"), advertiser: by("type", "advertiser"), partner: by("type", "partner") },
    status: Object.fromEntries(STATUSES.map((s) => [s, by("status", s)])) as Record<Status, number>,
  };
}

export async function getApplication(id: string) {
  if (!isUuid(id)) return null;
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/applications?id=eq.${id}&select=*`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`조회 실패 (${res.status})`);
  const rows: Application[] = await res.json();
  return rows[0] ?? null;
}

export async function updateApplication(id: string, patch: { status?: Status; admin_note?: string | null }) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  const { url, headers } = cfg();
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status && (STATUSES as readonly string[]).includes(patch.status)) body.status = patch.status;
  if (patch.admin_note !== undefined) body.admin_note = patch.admin_note ? patch.admin_note.slice(0, 4000) : null;
  const res = await fetch(`${url}/rest/v1/applications?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`저장 실패 (${res.status}): ${await res.text()}`);
}

export async function exportApplications(qs: Omit<ListQuery, "page" | "pageSize">) {
  const all: Application[] = [];
  for (let page = 1; page < 200; page++) {
    const { rows, total } = await listApplications({ ...qs, page, pageSize: 1000 });
    all.push(...rows);
    if (all.length >= total || rows.length === 0) break;
  }
  return all;
}
