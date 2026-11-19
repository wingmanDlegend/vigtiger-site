import "server-only";
import { cfg, isUuid } from "./db";
import type { GBInput, GroupBuy } from "@/lib/groupbuy";

// 공동구매 결과 — 관리자 전용 DB 접근 (secret 키)

export async function listGroupbuys(): Promise<GroupBuy[]> {
  const { url, headers } = cfg();
  const res = await fetch(
    `${url}/rest/v1/groupbuys?select=*&order=start_date.desc.nullslast,created_at.desc&limit=5000`,
    { headers, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`조회 실패 (${res.status}): ${await res.text()}`);
  return res.json();
}

export async function getGroupbuy(id: string): Promise<GroupBuy | null> {
  if (!isUuid(id)) return null;
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/groupbuys?id=eq.${id}&select=*&limit=1`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`조회 실패 (${res.status})`);
  const rows: GroupBuy[] = await res.json();
  return rows[0] ?? null;
}

export async function insertGroupbuys(rows: GBInput[]): Promise<GroupBuy[]> {
  if (rows.length === 0) return [];
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/groupbuys`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(rows),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`저장 실패 (${res.status}): ${await res.text()}`);
  return res.json();
}

export async function updateGroupbuy(id: string, row: GBInput): Promise<GroupBuy> {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/groupbuys?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`저장 실패 (${res.status}): ${await res.text()}`);
  const rows: GroupBuy[] = await res.json();
  if (!rows[0]) throw new Error("기록을 찾을 수 없습니다.");
  return rows[0];
}

export async function deleteGroupbuy(id: string) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/groupbuys?id=eq.${id}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=representation" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
  const rows: unknown[] = await res.json();
  if (rows.length === 0) throw new Error("이미 삭제되었거나 찾을 수 없는 기록입니다.");
}
