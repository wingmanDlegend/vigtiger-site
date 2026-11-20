"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { actorOf, requireAdmin } from "@/lib/partners/auth";
import { clearPromo, getPromoRequest, getProduct, listProducts, logEvent, patchProduct, patchPromoRequest } from "@/lib/partners/db";
import { TO_SITE_TAG } from "@/lib/tosite/data";

// to.vigtiger.com '이번 주 추천' · '핫딜' 노출 관리 (관리자 전용)
type Kind = "pick" | "hot";
const kindOf = (v: FormDataEntryValue | null): Kind | null => (v === "pick" || v === "hot" ? v : null);
const FLAG = { pick: "pick_week", hot: "hot_deal" } as const;
const SORT = { pick: "pick_sort", hot: "hot_sort" } as const;

function done(fd: FormData, msg: string) {
  revalidatePath("/admin/to/promo");
  revalidateTag(TO_SITE_TAG, { expire: 0 });
  const p = new URLSearchParams({ saved: msg });
  const q = String(fd.get("q") ?? "").slice(0, 60);
  if (q) p.set("q", q);
  redirect(`/to/promo?${p}`);
}
function fail(fd: FormData, msg: string): never {
  const p = new URLSearchParams({ error: msg });
  const q = String(fd.get("q") ?? "").slice(0, 60);
  if (q) p.set("q", q);
  redirect(`/to/promo?${p}`);
}

async function listed(kind: Kind) {
  const all = await listProducts();
  return all.filter((p) => p[FLAG[kind]]).sort((a, b) => a[SORT[kind]] - b[SORT[kind]]);
}

export async function promoAddAction(fd: FormData) {
  const s = await requireAdmin();
  const kind = kindOf(fd.get("kind"));
  const p = await getProduct(String(fd.get("id") ?? ""));
  if (!kind || !p) fail(fd, "제품을 찾을 수 없어요.");
  if (p.status !== "approved") fail(fd, "게시 중(승인)인 제품만 올릴 수 있어요.");
  const list = await listed(kind);
  const nextSort = list.length ? Math.max(...list.map((x) => x[SORT[kind]])) + 1 : 1;
  await patchProduct(p.id, { [FLAG[kind]]: true, [SORT[kind]]: nextSort });
  await logEvent({ ...actorOf(s), action: `promo_${kind}_on`, brand_id: p.brand_id, product_id: p.id, detail: { name: p.name } });
  done(fd, kind === "pick" ? "이번 주 추천에 올렸어요." : "핫딜에 올렸어요. 문구와 마감일을 정해 주세요.");
}

export async function promoRemoveAction(fd: FormData) {
  const s = await requireAdmin();
  const kind = kindOf(fd.get("kind"));
  const p = await getProduct(String(fd.get("id") ?? ""));
  if (!kind || !p) fail(fd, "제품을 찾을 수 없어요.");
  await patchProduct(p.id, kind === "pick" ? { pick_week: false, pick_sort: 0 } : { hot_deal: false, hot_sort: 0, hot_note: null, hot_until: null });
  await logEvent({ ...actorOf(s), action: `promo_${kind}_off`, brand_id: p.brand_id, product_id: p.id, detail: { name: p.name } });
  done(fd, kind === "pick" ? "이번 주 추천에서 내렸어요." : "핫딜에서 내렸어요.");
}

/** 순서 한 칸 위/아래 — 목록 순서대로 1,2,3… 다시 매깁니다 */
export async function promoMoveAction(fd: FormData) {
  await requireAdmin();
  const kind = kindOf(fd.get("kind"));
  const id = String(fd.get("id") ?? "");
  const dir = fd.get("dir") === "up" ? -1 : 1;
  if (!kind) fail(fd, "잘못된 요청이에요.");
  const list = await listed(kind);
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) fail(fd, "더 옮길 수 없어요.");
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((x, k) => (x[SORT[kind]] === k + 1 ? null : patchProduct(x.id, { [SORT[kind]]: k + 1 }))));
  done(fd, "순서를 바꿨어요.");
}

export async function promoSaveHotAction(fd: FormData) {
  const s = await requireAdmin();
  const p = await getProduct(String(fd.get("id") ?? ""));
  if (!p || !p.hot_deal) fail(fd, "핫딜 제품을 찾을 수 없어요.");
  const note = String(fd.get("hot_note") ?? "").trim().replace(/\s+/g, " ").slice(0, 60) || null;
  const until = String(fd.get("hot_until") ?? "").trim();
  if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) fail(fd, "마감일 형식이 올바르지 않아요.");
  await patchProduct(p.id, { hot_note: note, hot_until: until || null });
  await logEvent({ ...actorOf(s), action: "promo_hot_edited", brand_id: p.brand_id, product_id: p.id, detail: { name: p.name, note, until: until || null } });
  done(fd, "핫딜 문구·마감일을 저장했어요.");
}

export async function promoClearAction(fd: FormData) {
  const s = await requireAdmin();
  const kind = kindOf(fd.get("kind"));
  if (!kind) fail(fd, "잘못된 요청이에요.");
  const n = await clearPromo(kind);
  await logEvent({ ...actorOf(s), action: "promo_cleared", brand_id: null, product_id: null, detail: { kind, count: n } });
  done(fd, `${kind === "pick" ? "이번 주 추천" : "핫딜"} ${n}개를 모두 내렸어요.`);
}

// ---------- 브랜드가 신청한 추천·핫딜 ----------
export async function promoRequestApproveAction(fd: FormData) {
  const s = await requireAdmin();
  const r = await getPromoRequest(String(fd.get("rid") ?? ""));
  if (!r || r.status !== "pending") fail(fd, "이미 처리된 신청이에요.");
  const p = await getProduct(r.product_id);
  if (!p) fail(fd, "제품을 찾을 수 없어요 (삭제된 제품).");
  if (p.status !== "approved") fail(fd, "게시 중(승인)인 제품이 아니라 올릴 수 없어요.");
  const kind = r.kind;
  const list = await listed(kind);
  const nextSort = list.length ? Math.max(...list.map((x) => x[SORT[kind]])) + 1 : 1;
  const row: Record<string, unknown> = { [FLAG[kind]]: true };
  if (!p[FLAG[kind]]) row[SORT[kind]] = nextSort;
  if (kind === "hot") {
    row.hot_note = r.hot_note ?? p.hot_note ?? null;
    row.hot_until = r.end_date ?? p.hot_until ?? null;
  }
  await patchProduct(p.id, row);
  await patchPromoRequest(r.id, { status: "approved", decided_at: new Date().toISOString(), reject_reason: null });
  await logEvent({ ...actorOf(s), action: "promo_request_approved", brand_id: r.brand_id, product_id: p.id, detail: { kind, name: p.name } });
  revalidatePath("/partners/promo");
  done(fd, `${p.name} — ${kind === "pick" ? "이번 주 추천" : "핫딜"}에 올렸어요.`);
}

export async function promoRequestRejectAction(fd: FormData) {
  const s = await requireAdmin();
  const r = await getPromoRequest(String(fd.get("rid") ?? ""));
  if (!r || r.status !== "pending") fail(fd, "이미 처리된 신청이에요.");
  const reason = String(fd.get("reason") ?? "").trim().replace(/\s+/g, " ").slice(0, 300);
  if (!reason) fail(fd, "반려 사유를 적어 주세요. (브랜드 담당자에게 보여요)");
  await patchPromoRequest(r.id, { status: "rejected", reject_reason: reason, decided_at: new Date().toISOString() });
  await logEvent({ ...actorOf(s), action: "promo_request_rejected", brand_id: r.brand_id, product_id: r.product_id, detail: { kind: r.kind, reason } });
  revalidatePath("/partners/promo");
  done(fd, "신청을 반려했어요.");
}
