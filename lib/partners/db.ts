import "server-only";
import { cfg, isUuid } from "@/lib/admin/db";
import type { PartnerBrand, PartnerUser, ToProduct } from "./model";
import seed from "@/data/partners-seed.json";

// partners 사이트 — Supabase(PostgREST)를 비밀 키로 호출 (서버 전용)

async function rest<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.prefer ? { Prefer: init.prefer } : {}), ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    if (res.status === 409 || t.includes("23505")) throw new Error("이미 같은 값이 있어요. (중복)");
    throw new Error(`DB 오류 (${res.status}): ${t.slice(0, 300)}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
const enc = encodeURIComponent;
const USER_COLS = "id,email,name,phone,role,brand_id,must_change_password,failed_attempts,locked_until,active,token_version,last_login_at,created_at";

// ---------- 계정 ----------
export async function getUserById(id: string) {
  if (!isUuid(id)) return null;
  const rows = await rest<PartnerUser[]>(`partner_users?id=eq.${id}&select=${USER_COLS}`);
  return rows[0] ?? null;
}
export async function getUserForLogin(email: string) {
  const rows = await rest<(PartnerUser & { password_hash: string })[]>(
    `partner_users?email=ilike.${enc(email.replace(/[%_*\\]/g, ""))}&select=${USER_COLS},password_hash&limit=2`,
  );
  return rows.length === 1 ? rows[0] : null;
}
/** 로그인 실패 1회 기록 (DB 함수로 원자적으로 증가, 5회째 15분 잠금). 잠겼으면 true */
export async function loginFailed(id: string) {
  return rest<boolean>(`rpc/partner_login_failed`, { method: "POST", body: JSON.stringify({ uid: id }) });
}
export async function getPasswordHash(id: string) {
  const rows = await rest<{ password_hash: string }[]>(`partner_users?id=eq.${id}&select=password_hash`);
  return rows[0]?.password_hash ?? null;
}
export async function listUsers(brandId?: string) {
  const f = brandId ? `&brand_id=eq.${brandId}` : "";
  return rest<PartnerUser[]>(`partner_users?select=${USER_COLS}${f}&order=role.asc,created_at.asc&limit=1000`);
}
export async function insertUser(row: Record<string, unknown>) {
  const rows = await rest<PartnerUser[]>(`partner_users?select=${USER_COLS}`, { method: "POST", body: JSON.stringify(row), prefer: "return=representation" });
  return rows[0];
}
export async function patchUser(id: string, row: Record<string, unknown>) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  const rows = await rest<PartnerUser[]>(`partner_users?id=eq.${id}&select=${USER_COLS}`, {
    method: "PATCH",
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
    prefer: "return=representation",
  });
  if (!rows[0]) throw new Error("계정을 찾을 수 없어요.");
  return rows[0];
}
export async function deleteUser(id: string) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  await rest(`partner_users?id=eq.${id}`, { method: "DELETE" });
}

// ---------- 브랜드 ----------
export async function listBrands() {
  return rest<PartnerBrand[]>(`partner_brands?select=*&order=sort.asc,name_ko.asc&limit=1000`);
}
export async function getBrand(id: string) {
  if (!isUuid(id)) return null;
  const rows = await rest<PartnerBrand[]>(`partner_brands?id=eq.${id}&select=*`);
  return rows[0] ?? null;
}
export async function insertBrand(row: Record<string, unknown>) {
  const rows = await rest<PartnerBrand[]>(`partner_brands`, { method: "POST", body: JSON.stringify(row), prefer: "return=representation" });
  return rows[0];
}
export async function patchBrand(id: string, row: Record<string, unknown>) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  const rows = await rest<PartnerBrand[]>(`partner_brands?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
    prefer: "return=representation",
  });
  if (!rows[0]) throw new Error("브랜드를 찾을 수 없어요.");
  return rows[0];
}
export async function deleteBrand(id: string) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  await rest(`partner_brands?id=eq.${id}`, { method: "DELETE" });
}

// ---------- 제품 ----------
export async function listProducts(q: { brandId?: string; status?: string; ids?: string[] } = {}) {
  const p = new URLSearchParams({ select: "*", order: "sort.asc,created_at.asc", limit: "5000" });
  if (q.brandId) p.set("brand_id", `eq.${q.brandId}`);
  if (q.status) p.set("status", `eq.${q.status}`);
  return rest<ToProduct[]>(`to_products?${p}`);
}
/** 승인 대기: 새 제품 + 수정 요청 + 삭제 요청 */
export async function listReviewQueue() {
  return rest<ToProduct[]>(
    `to_products?select=*&or=(status.eq.pending,pending_changes.not.is.null,delete_requested.is.true)&order=change_requested_at.asc.nullslast,created_at.asc&limit=1000`,
  );
}
export async function listBrandChangeRequests() {
  return rest<PartnerBrand[]>(`partner_brands?select=*&pending_changes=not.is.null&order=change_requested_at.asc`);
}
export async function getProduct(id: string) {
  if (!isUuid(id)) return null;
  const rows = await rest<ToProduct[]>(`to_products?id=eq.${id}&select=*`);
  return rows[0] ?? null;
}
export async function insertProduct(row: Record<string, unknown>) {
  const rows = await rest<ToProduct[]>(`to_products`, { method: "POST", body: JSON.stringify(row), prefer: "return=representation" });
  return rows[0];
}
export async function patchProduct(id: string, row: Record<string, unknown>) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  const rows = await rest<ToProduct[]>(`to_products?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
    prefer: "return=representation",
  });
  if (!rows[0]) throw new Error("제품을 찾을 수 없어요.");
  return rows[0];
}
/** to.vigtiger.com 이번 주 추천·핫딜을 한꺼번에 내리기 */
export async function clearPromo(kind: "pick" | "hot") {
  const row = kind === "pick" ? { pick_week: false, pick_sort: 0 } : { hot_deal: false, hot_sort: 0, hot_note: null, hot_until: null };
  const rows = await rest<{ id: string }[]>(`to_products?${kind === "pick" ? "pick_week" : "hot_deal"}=is.true&select=id`, {
    method: "PATCH",
    body: JSON.stringify(row),
    prefer: "return=representation",
  });
  return rows.length;
}
export async function deleteProduct(id: string) {
  if (!isUuid(id)) throw new Error("잘못된 ID");
  await rest(`to_products?id=eq.${id}`, { method: "DELETE" });
}
/** 브랜드 코드 다음 일련번호 (예: OA-16) */
export async function nextSerial(brandId: string, code: string) {
  const rows = await rest<{ serial: string | null }[]>(`to_products?brand_id=eq.${brandId}&serial=not.is.null&select=serial&limit=5000`);
  const all = await rest<{ serial: string }[]>(`to_products?serial=like.${enc(code + "-*")}&select=serial&limit=5000`);
  const used = new Set([...rows, ...all].map((r) => r.serial));
  let max = 0;
  for (const s of used) {
    const m = s?.match(/-(\d+)$/);
    if (m && s!.startsWith(code + "-")) max = Math.max(max, Number(m[1]));
  }
  return `${code}-${max + 1}`;
}
export async function maxSort(brandId: string) {
  const rows = await rest<{ sort: number }[]>(`to_products?brand_id=eq.${brandId}&select=sort&order=sort.desc&limit=1`);
  return rows[0]?.sort ?? 0;
}

// ---------- 작업 기록 ----------
export type PartnerEvent = {
  id: number;
  created_at: string;
  actor_id: string | null;
  actor_label: string | null;
  action: string;
  brand_id: string | null;
  product_id: string | null;
  detail: Record<string, unknown> | null;
};
export async function logEvent(e: Omit<PartnerEvent, "id" | "created_at">) {
  try {
    await rest(`partner_events`, { method: "POST", body: JSON.stringify(e) });
  } catch (err) {
    console.error("partner_events", err);
  }
}
export async function listEvents(q: { brandId?: string; productId?: string; limit?: number } = {}) {
  const p = new URLSearchParams({ select: "*", order: "created_at.desc", limit: String(q.limit ?? 50) });
  if (q.brandId) p.set("brand_id", `eq.${q.brandId}`);
  if (q.productId) p.set("product_id", `eq.${q.productId}`);
  return rest<PartnerEvent[]>(`partner_events?${p}`);
}

// ---------- 초기 데이터 (티오 제품 리스트 PDF) ----------
type SeedBrand = (typeof seed.brands)[number];
/** 브랜드가 하나도 없을 때만 한 번 넣습니다. 여러 번 불려도 중복되지 않습니다. */
export async function ensureSeeded() {
  const head = await rest<{ id: string }[]>(`partner_brands?select=id&limit=1`);
  if (head.length) return false;
  const brands = (seed.brands as SeedBrand[]).map((b, i) => ({
    code: b.code,
    name_ko: b.name_ko,
    name_en: b.name_en,
    category: b.category,
    highlights: b.highlights,
    description: b.description,
    notice: b.notice,
    hero_url: b.hero_url,
    sort: (i + 1) * 10,
  }));
  const saved = await rest<{ id: string; code: string }[]>(`partner_brands?on_conflict=code&select=id,code`, {
    method: "POST",
    body: JSON.stringify(brands),
    prefer: "return=representation,resolution=ignore-duplicates",
  });
  const idOf = new Map(saved.map((b) => [b.code, b.id]));
  const now = new Date().toISOString();
  const products = (seed.brands as SeedBrand[]).flatMap((b) =>
    b.products.map((p, j) => ({
      brand_id: idOf.get(b.code),
      serial: p.serial,
      name: p.name,
      feature: p.feature,
      section: p.section,
      sponsor: p.sponsor,
      rental: p.rental,
      product_url: p.product_url,
      image_url: p.image_url,
      note: p.note,
      sort: (j + 1) * 10,
      status: "approved",
      approved_at: now,
    })),
  ).filter((p) => p.brand_id);
  for (let i = 0; i < products.length; i += 200) {
    await rest(`to_products?on_conflict=serial`, {
      method: "POST",
      body: JSON.stringify(products.slice(i, i + 200)),
      prefer: "return=minimal,resolution=ignore-duplicates",
    });
  }
  await logEvent({ actor_id: null, actor_label: "시스템", action: "seed", brand_id: null, product_id: null, detail: { brands: brands.length, products: products.length, source: seed.source } });
  return true;
}

// ---------- 집계 ----------
export async function countWhere(table: string, filter: string) {
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/${table}?select=id&${filter}`, {
    method: "HEAD",
    headers: { ...headers, Prefer: "count=exact" },
    cache: "no-store",
  });
  return Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
}
