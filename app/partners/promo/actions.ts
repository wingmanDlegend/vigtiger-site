"use server";

import { revalidatePath } from "next/cache";
import { actorOf, requireBrand } from "@/lib/partners/auth";
import { getBrand, getProduct, getPromoRequest, insertPromoRequest, listPromoRequests, logEvent, patchPromoRequest } from "@/lib/partners/db";
import { PROMO_KIND_LABEL, type PromoKind } from "@/lib/partners/model";
import { notifyPartners } from "@/lib/partners/storage";

// partners.vigtiger.com — 브랜드가 '이번 주 추천' · '핫딜'로 제품을 신청합니다.
// 신청은 대범한사람들 담당자가 확인한 뒤 admin.vigtiger.com [추천·핫딜]에서 진행합니다.
export type PromoResult = { ok: boolean; message: string; errors?: string[] };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const one = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

function refresh() {
  revalidatePath("/partners/promo");
  revalidatePath("/admin/to/promo");
  revalidatePath("/admin/dashboard");
}

export async function requestPromoAction(raw: Record<string, unknown>): Promise<PromoResult> {
  const s = await requireBrand();
  const brandId = s.brandId as string;
  const errors: string[] = [];
  const kind = raw.kind === "pick" || raw.kind === "hot" ? (raw.kind as PromoKind) : null;
  const productId = one(raw.product_id, 40);
  const hot_note = kind === "hot" ? one(raw.hot_note, 80) : "";
  const start = one(raw.start_date, 10);
  const end = one(raw.end_date, 10);
  const message = text(raw.message, 1200);
  if (!kind) errors.push("이번 주 추천과 핫딜 중 하나를 골라 주세요.");
  if (!productId) errors.push("신청할 제품을 골라 주세요.");
  if (hot_note.length > 60) errors.push("핫딜 문구는 60자까지 쓸 수 있어요.");
  if ((start && !DATE.test(start)) || (end && !DATE.test(end))) errors.push("날짜 형식이 올바르지 않아요.");
  if (start && end && end < start) errors.push("종료일이 시작일보다 빨라요.");
  if (message.length > 1000) errors.push("전달할 내용은 1,000자까지 쓸 수 있어요.");
  if (errors.length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors };

  try {
    const p = await getProduct(productId);
    if (!p || p.brand_id !== brandId) return { ok: false, message: "우리 브랜드 제품을 골라 주세요." };
    if (p.status !== "approved") return { ok: false, message: "게시 중(승인된) 제품만 신청할 수 있어요." };
    if (kind === "pick" && p.pick_week) return { ok: false, message: "이미 이번 주 추천에 올라 있는 제품이에요." };
    if (kind === "hot" && p.hot_deal) return { ok: false, message: "이미 핫딜에 올라 있는 제품이에요." };
    const mine = await listPromoRequests({ brandId, status: "pending" });
    if (mine.some((r) => r.product_id === p.id && r.kind === kind)) {
      return { ok: false, message: `이 제품은 이미 ${PROMO_KIND_LABEL[kind!]} 신청이 들어가 있어요. 담당자가 확인 후 진행하겠습니다.` };
    }
    await insertPromoRequest({
      brand_id: brandId,
      product_id: p.id,
      kind,
      hot_note: hot_note || null,
      start_date: start || null,
      end_date: end || null,
      message: message || null,
      status: "pending",
      created_by: s.userId,
    });
    await logEvent({ ...actorOf(s), action: "promo_requested", brand_id: brandId, product_id: p.id, detail: { kind, name: p.name } });
    const b = await getBrand(brandId);
    await notifyPartners(`${b?.name_ko ?? "브랜드"} — ${PROMO_KIND_LABEL[kind!]} 신청: ${p.serial ?? ""} ${p.name}`, "/to/promo");
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "신청하지 못했어요." };
  }
  refresh();
  return { ok: true, message: "신청했어요. 담당자가 확인 후 진행하겠습니다." };
}

export async function cancelPromoRequestAction(id: string): Promise<PromoResult> {
  const s = await requireBrand();
  try {
    const r = await getPromoRequest(id);
    if (!r || r.brand_id !== s.brandId) return { ok: false, message: "신청을 찾을 수 없어요." };
    if (r.status !== "pending") return { ok: false, message: "이미 처리된 신청이에요." };
    await patchPromoRequest(id, { status: "canceled", decided_at: new Date().toISOString() });
    await logEvent({ ...actorOf(s), action: "promo_request_canceled", brand_id: r.brand_id, product_id: r.product_id, detail: { kind: r.kind } });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "처리하지 못했어요." };
  }
  refresh();
  return { ok: true, message: "신청을 취소했어요." };
}
