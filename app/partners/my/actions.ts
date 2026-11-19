"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actorOf, requireBrand } from "@/lib/partners/auth";
import { deleteProduct, getBrand, getProduct, insertProduct, logEvent, maxSort, patchBrand, patchProduct } from "@/lib/partners/db";
import {
  brandToProfile,
  cleanBrandProfile,
  cleanProduct,
  diffKeys,
  draftToRow,
  productToDraft,
  type ProductDraft,
} from "@/lib/partners/model";
import { notifyPartners } from "@/lib/partners/storage";

export type ActionResult = { ok: boolean; message: string; errors?: string[] };

// 브랜드 담당자 작업 — 모든 변경은 관리자 승인 후 반영됩니다.
// - 아직 승인 전(승인 대기·반려) 제품: 바로 고치고 다시 '승인 대기'
// - 게시 중 제품: 바뀐 항목만 '수정 요청'으로 보관, 승인되면 반영
// - 삭제: 승인 전 제품은 바로 삭제, 게시 중 제품은 '삭제 요청'

async function brandSession() {
  const s = await requireBrand();
  return s as typeof s & { brandId: string };
}
async function ownProduct(brandId: string, id: string) {
  const p = await getProduct(id);
  if (!p || p.brand_id !== brandId) throw new Error("이 브랜드의 제품이 아니에요.");
  return p;
}
function done() {
  revalidatePath("/partners/my");
  revalidatePath("/partners/admin/review");
}

export async function createProductAction(raw: Record<string, unknown>): Promise<ActionResult> {
  const s = await brandSession();
  const { value, errors } = cleanProduct(raw);
  if (errors.length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors };
  let id = "";
  try {
    const brand = await getBrand(s.brandId);
    if (!brand?.active) return { ok: false, message: "브랜드가 사용 중지 상태예요. 관리자에게 문의해 주세요." };
    const p = await insertProduct({ ...draftToRow(value), brand_id: s.brandId, status: "pending", created_by: s.userId, sort: (await maxSort(s.brandId)) + 10 });
    id = p.id;
    await logEvent({ ...actorOf(s), action: "product_submitted", brand_id: s.brandId, product_id: p.id, detail: { name: value.name } });
    await notifyPartners(`${brand.name_ko} — 새 제품 등록 요청: ${value.name}`);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "저장하지 못했어요." };
  }
  done();
  redirect(`/my?sent=new&id=${id}`);
}

export async function updateProductAction(id: string, raw: Record<string, unknown>): Promise<ActionResult> {
  const s = await brandSession();
  const { value, errors } = cleanProduct(raw);
  if (errors.length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors };
  try {
    const p = await ownProduct(s.brandId, id);
    const brand = await getBrand(s.brandId);
    if (p.status === "pending" || p.status === "rejected") {
      await patchProduct(id, { ...draftToRow(value), status: "pending", reject_reason: null, change_requested_at: new Date().toISOString() });
      await logEvent({ ...actorOf(s), action: "product_resubmitted", brand_id: s.brandId, product_id: id, detail: { name: value.name } });
      if (p.status === "rejected") await notifyPartners(`${brand?.name_ko} — 반려된 제품 다시 요청: ${value.name}`);
    } else {
      const before = productToDraft(p);
      const keys = diffKeys(before, value);
      if (keys.length === 0) {
        if (p.pending_changes) {
          await patchProduct(id, { pending_changes: null, change_requested_at: null });
          done();
          return { ok: true, message: "지금 게시된 내용과 같아서 수정 요청을 취소했어요." };
        }
        return { ok: true, message: "바뀐 내용이 없어요." };
      }
      const changes = Object.fromEntries(keys.map((k) => [k, value[k]])) as Partial<ProductDraft>;
      await patchProduct(id, { pending_changes: changes, change_requested_at: new Date().toISOString(), reject_reason: null });
      await logEvent({ ...actorOf(s), action: "change_requested", brand_id: s.brandId, product_id: id, detail: { fields: keys } });
      await notifyPartners(`${brand?.name_ko} — 제품 수정 요청: ${p.serial ?? ""} ${p.name}`);
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "저장하지 못했어요." };
  }
  done();
  redirect(`/my?sent=edit&id=${id}`);
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const s = await brandSession();
  try {
    const p = await ownProduct(s.brandId, id);
    if (p.status === "pending" || p.status === "rejected") {
      await deleteProduct(id);
      await logEvent({ ...actorOf(s), action: "product_withdrawn", brand_id: s.brandId, product_id: null, detail: { name: p.name } });
      done();
      return { ok: true, message: "등록 요청을 취소하고 삭제했어요." };
    }
    await patchProduct(id, { delete_requested: true, change_requested_at: new Date().toISOString(), reject_reason: null });
    await logEvent({ ...actorOf(s), action: "delete_requested", brand_id: s.brandId, product_id: id, detail: { serial: p.serial, name: p.name } });
    const brand = await getBrand(s.brandId);
    await notifyPartners(`${brand?.name_ko} — 제품 삭제 요청: ${p.serial ?? ""} ${p.name}`);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "처리하지 못했어요." };
  }
  done();
  return { ok: true, message: "삭제를 요청했어요. 관리자가 승인하면 리스트에서 빠져요." };
}

export async function cancelRequestAction(id: string): Promise<ActionResult> {
  const s = await brandSession();
  try {
    const p = await ownProduct(s.brandId, id);
    await patchProduct(id, { pending_changes: null, delete_requested: false, change_requested_at: null });
    await logEvent({ ...actorOf(s), action: "request_canceled", brand_id: s.brandId, product_id: id, detail: { name: p.name } });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "처리하지 못했어요." };
  }
  done();
  return { ok: true, message: "요청을 취소했어요." };
}

export async function updateProfileAction(raw: Record<string, unknown>): Promise<ActionResult> {
  const s = await brandSession();
  const { value, errors } = cleanBrandProfile(raw);
  if (errors.length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors };
  try {
    const b = await getBrand(s.brandId);
    if (!b) throw new Error("브랜드를 찾을 수 없어요.");
    const keys = diffKeys(brandToProfile(b), value);
    if (keys.length === 0) {
      if (b.pending_changes) await patchBrand(b.id, { pending_changes: null, change_requested_at: null });
      revalidatePath("/partners/my/profile");
      return { ok: true, message: b.pending_changes ? "지금 내용과 같아서 수정 요청을 취소했어요." : "바뀐 내용이 없어요." };
    }
    const changes = Object.fromEntries(keys.map((k) => [k, value[k]]));
    await patchBrand(b.id, { pending_changes: changes, change_requested_at: new Date().toISOString(), reject_reason: null });
    await logEvent({ ...actorOf(s), action: "brand_change_requested", brand_id: b.id, product_id: null, detail: { fields: keys } });
    await notifyPartners(`${b.name_ko} — 브랜드 정보 수정 요청`);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "저장하지 못했어요." };
  }
  revalidatePath("/partners/my/profile");
  revalidatePath("/partners/admin/review");
  return { ok: true, message: "수정을 요청했어요. 관리자가 승인하면 반영돼요." };
}

export async function cancelProfileRequestAction(): Promise<ActionResult> {
  const s = await brandSession();
  await patchBrand(s.brandId, { pending_changes: null, change_requested_at: null });
  revalidatePath("/partners/my/profile");
  return { ok: true, message: "수정 요청을 취소했어요." };
}

