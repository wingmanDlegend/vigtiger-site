"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { actorOf, hashPassword, requireAdmin, tempPassword } from "@/lib/partners/auth";
import {
  deleteBrand,
  deleteProduct,
  deleteUser,
  getBrand,
  getProduct,
  getUserById,
  insertBrand,
  insertProduct,
  insertUser,
  listProducts,
  listUsers,
  logEvent,
  maxSort,
  nextSerial,
  patchBrand,
  patchProduct,
  patchUser,
} from "@/lib/partners/db";
import {
  CATEGORIES,
  cleanBrandProfile,
  cleanProduct,
  draftToRow,
  profileToRow,
  type ProductStatus,
} from "@/lib/partners/model";

export type ActionResult = { ok: boolean; message: string; errors?: string[]; password?: string };

import { TO_SITE_TAG } from "@/lib/tosite/data";

const admin = () => requireAdmin();
const err = (e: unknown, fallback = "처리하지 못했어요.") => ({ ok: false, message: e instanceof Error ? e.message : fallback });
function refresh() {
  for (const p of ["/admin/to", "/admin/to/review", "/admin/to/products", "/admin/to/brands", "/admin/to/catalog", "/admin/to/promo", "/admin/dashboard", "/partners/my", "/partners/catalog"]) revalidatePath(p);
  // to.vigtiger.com 제품 리스트·신청서도 바로 새 내용으로
  revalidateTag(TO_SITE_TAG, { expire: 0 });
}
const cleanReason = (r: unknown) => (typeof r === "string" ? r.trim().replace(/\s+/g, " ").slice(0, 300) : "");

// ---------- 승인 ----------
export async function approveProductAction(id: string): Promise<ActionResult> {
  const s = await admin();
  try {
    const p = await getProduct(id);
    if (!p) throw new Error("제품을 찾을 수 없어요.");
    if (p.delete_requested) {
      await deleteProduct(id);
      await logEvent({ ...actorOf(s), action: "delete_approved", brand_id: p.brand_id, product_id: null, detail: { serial: p.serial, name: p.name } });
      refresh();
      return { ok: true, message: `${p.serial ?? ""} ${p.name} — 삭제했어요.` };
    }
    if (p.status === "pending") {
      const brand = await getBrand(p.brand_id);
      const serial = p.serial ?? (brand ? await nextSerial(brand.id, brand.code) : null);
      await patchProduct(id, { status: "approved", serial, approved_at: new Date().toISOString(), reject_reason: null, change_requested_at: null });
      await logEvent({ ...actorOf(s), action: "product_approved", brand_id: p.brand_id, product_id: id, detail: { serial, name: p.name } });
      refresh();
      return { ok: true, message: `${serial} ${p.name} — 승인해서 리스트에 올렸어요.` };
    }
    if (p.pending_changes) {
      const row = draftToRow(p.pending_changes);
      await patchProduct(id, { ...row, pending_changes: null, change_requested_at: null, reject_reason: null });
      await logEvent({ ...actorOf(s), action: "change_approved", brand_id: p.brand_id, product_id: id, detail: { fields: Object.keys(p.pending_changes) } });
      refresh();
      return { ok: true, message: `${p.serial ?? ""} ${p.name} — 수정 내용을 반영했어요.` };
    }
    return { ok: true, message: "승인할 요청이 없어요." };
  } catch (e) {
    return err(e);
  }
}

export async function rejectProductAction(id: string, reason: string): Promise<ActionResult> {
  const s = await admin();
  const r = cleanReason(reason);
  if (!r) return { ok: false, message: "반려 사유를 적어 주세요. 브랜드 담당자에게 그대로 보여요." };
  try {
    const p = await getProduct(id);
    if (!p) throw new Error("제품을 찾을 수 없어요.");
    if (p.status === "pending") await patchProduct(id, { status: "rejected", reject_reason: r });
    else await patchProduct(id, { pending_changes: null, delete_requested: false, change_requested_at: null, reject_reason: r });
    await logEvent({ ...actorOf(s), action: "rejected", brand_id: p.brand_id, product_id: id, detail: { reason: r, kind: p.status === "pending" ? "new" : p.delete_requested ? "delete" : "edit" } });
  } catch (e) {
    return err(e);
  }
  refresh();
  return { ok: true, message: "반려했어요. 브랜드 담당자 화면에 사유가 보여요." };
}

export async function approveBrandAction(id: string): Promise<ActionResult> {
  const s = await admin();
  try {
    const b = await getBrand(id);
    if (!b?.pending_changes) return { ok: true, message: "승인할 요청이 없어요." };
    await patchBrand(id, { ...profileToRow(b.pending_changes), pending_changes: null, change_requested_at: null, reject_reason: null });
    await logEvent({ ...actorOf(s), action: "brand_change_approved", brand_id: id, product_id: null, detail: { fields: Object.keys(b.pending_changes) } });
    refresh();
    return { ok: true, message: `${b.name_ko} 브랜드 정보를 반영했어요.` };
  } catch (e) {
    return err(e);
  }
}

export async function rejectBrandAction(id: string, reason: string): Promise<ActionResult> {
  const s = await admin();
  const r = cleanReason(reason);
  if (!r) return { ok: false, message: "반려 사유를 적어 주세요." };
  try {
    await patchBrand(id, { pending_changes: null, change_requested_at: null, reject_reason: r });
    await logEvent({ ...actorOf(s), action: "brand_change_rejected", brand_id: id, product_id: null, detail: { reason: r } });
  } catch (e) {
    return err(e);
  }
  refresh();
  return { ok: true, message: "반려했어요." };
}

// ---------- 제품 직접 관리 ----------
const STATUSES: ProductStatus[] = ["pending", "approved", "rejected", "hidden"];

export async function adminSaveProductAction(id: string | null, raw: Record<string, unknown>): Promise<ActionResult> {
  const s = await admin();
  const { value, errors } = cleanProduct(raw);
  const brandId = String(raw.brand_id ?? "");
  const status = STATUSES.includes(raw.status as ProductStatus) ? (raw.status as ProductStatus) : "approved";
  let serial = String(raw.serial ?? "").trim().toUpperCase();
  const sort = Number(raw.sort) || 0;
  const to_visible = raw.to_visible !== false && raw.to_visible !== "false";
  if (serial && !/^[A-Z0-9]{1,8}-\d{1,4}$/.test(serial)) errors.push("일련번호는 'OA-12'처럼 브랜드코드-숫자 형식이에요.");
  if (errors.length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors };
  let newId = id;
  try {
    const brand = await getBrand(brandId);
    if (!brand) throw new Error("브랜드를 골라 주세요.");
    if (!serial && status === "approved") serial = await nextSerial(brand.id, brand.code);
    const row = {
      ...draftToRow(value),
      brand_id: brand.id,
      serial: serial || null,
      status,
      to_visible,
      sort: sort || (await maxSort(brand.id)) + 10,
      ...(status === "approved" ? { approved_at: new Date().toISOString() } : {}),
    };
    if (id) {
      const before = await getProduct(id);
      await patchProduct(id, row);
      await logEvent({ ...actorOf(s), action: "admin_edited", brand_id: brand.id, product_id: id, detail: { serial, name: value.name, status, was: before?.status } });
    } else {
      const p = await insertProduct({ ...row, created_by: s.userId });
      newId = p.id;
      await logEvent({ ...actorOf(s), action: "admin_created", brand_id: brand.id, product_id: p.id, detail: { serial, name: value.name } });
    }
  } catch (e) {
    return err(e, "저장하지 못했어요.");
  }
  refresh();
  if (!id) redirect(`/to/products/${newId}?saved=1`);
  return { ok: true, message: "저장했어요." };
}

export async function setProductStatusAction(id: string, status: ProductStatus): Promise<ActionResult> {
  const s = await admin();
  if (!STATUSES.includes(status)) return { ok: false, message: "잘못된 상태" };
  try {
    const p = await getProduct(id);
    if (!p) throw new Error("제품을 찾을 수 없어요.");
    const extra = status === "approved" && !p.serial ? { serial: await nextSerial(p.brand_id, (await getBrand(p.brand_id))!.code), approved_at: new Date().toISOString() } : {};
    await patchProduct(id, { status, ...extra });
    await logEvent({ ...actorOf(s), action: "status_changed", brand_id: p.brand_id, product_id: id, detail: { from: p.status, to: status } });
  } catch (e) {
    return err(e);
  }
  refresh();
  return { ok: true, message: "상태를 바꿨어요." };
}

export async function adminDeleteProductAction(id: string): Promise<ActionResult> {
  const s = await admin();
  try {
    const p = await getProduct(id);
    if (!p) throw new Error("이미 삭제됐어요.");
    await deleteProduct(id);
    await logEvent({ ...actorOf(s), action: "admin_deleted", brand_id: p.brand_id, product_id: null, detail: { serial: p.serial, name: p.name } });
  } catch (e) {
    return err(e);
  }
  refresh();
  redirect("/to/products?deleted=1");
}

// ---------- 브랜드 ----------
function cleanBrandBasics(raw: Record<string, unknown>) {
  const errors: string[] = [];
  const name_ko = String(raw.name_ko ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
  const code = String(raw.code ?? "").trim().toUpperCase();
  const category = String(raw.category ?? "");
  const sort = Number(raw.sort) || 0;
  const active = raw.active === true || raw.active === "true";
  if (!name_ko) errors.push("브랜드 이름을 입력해 주세요.");
  if (!/^[A-Z0-9]{1,8}$/.test(code)) errors.push("브랜드 코드는 영문 대문자·숫자 1~8자예요. (일련번호 앞부분, 예: OA)");
  if (!CATEGORIES.some((c) => c.key === category)) errors.push("분류를 골라 주세요.");
  return { value: { name_ko, code, category, sort, active }, errors };
}

export async function adminSaveBrandAction(id: string | null, raw: Record<string, unknown>): Promise<ActionResult> {
  const s = await admin();
  const a = cleanBrandBasics(raw);
  const b = cleanBrandProfile(raw);
  const errors = [...a.errors, ...b.errors];
  if (errors.length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors };
  let newId = id;
  try {
    const row = { ...a.value, ...profileToRow(b.value) };
    if (id) {
      const before = await getBrand(id);
      if (before && before.code !== a.value.code) {
        const ps = await listProducts({ brandId: id });
        if (ps.some((p) => p.serial)) throw new Error("이미 일련번호가 붙은 제품이 있어서 브랜드 코드를 바꿀 수 없어요.");
      }
      await patchBrand(id, row);
      await logEvent({ ...actorOf(s), action: "brand_edited", brand_id: id, product_id: null, detail: { name: a.value.name_ko } });
    } else {
      const nb = await insertBrand({ ...row, sort: a.value.sort || 9990 });
      newId = nb.id;
      await logEvent({ ...actorOf(s), action: "brand_created", brand_id: nb.id, product_id: null, detail: { name: a.value.name_ko, code: a.value.code } });
    }
  } catch (e) {
    return err(e, "저장하지 못했어요.");
  }
  refresh();
  if (!id) redirect(`/to/brands/${newId}?created=1`);
  return { ok: true, message: "저장했어요. (관리자 저장은 바로 반영돼요)" };
}

export async function adminDeleteBrandAction(id: string): Promise<ActionResult> {
  const s = await admin();
  try {
    const [b, users, products] = await Promise.all([getBrand(id), listUsers(id), listProducts({ brandId: id })]);
    if (!b) throw new Error("이미 삭제됐어요.");
    if (users.length) throw new Error("이 브랜드의 계정을 먼저 삭제해 주세요.");
    if (products.length) throw new Error(`제품 ${products.length}개가 있어요. 제품을 먼저 삭제하거나, 대신 '리스트에 노출'을 꺼 주세요.`);
    await deleteBrand(id);
    await logEvent({ ...actorOf(s), action: "brand_deleted", brand_id: null, product_id: null, detail: { name: b.name_ko, code: b.code } });
  } catch (e) {
    return err(e);
  }
  refresh();
  redirect("/to/brands?deleted=1");
}

// ---------- 계정 ----------
// 두 종류 계정의 권한
//  - 브랜드 담당자 계정(partners.vigtiger.com): 관리자(대표·직원)라면 누구나 발급·재발급·중지·삭제
//  - 직원 계정(admin.vigtiger.com): 대표 관리자만 발급·재발급·중지·삭제 (직원은 자기 비밀번호 변경만)
type Target = { role: "admin" | "brand"; brand_id: string | null; email: string; name: string };
type Session = Awaited<ReturnType<typeof admin>>;

function guardTarget(s: Session, t: Pick<Target, "role">): string | null {
  if (t.role === "admin" && s.kind !== "master") return "직원 계정은 대표 관리자만 발급·변경할 수 있어요.";
  return null;
}
const ev = (t: Pick<Target, "role">, brandAction: string, staffAction: string) => (t.role === "admin" ? staffAction : brandAction);
function refreshAccounts() {
  revalidatePath("/admin/settings/accounts");
  revalidatePath("/admin/to/brands");
  revalidatePath("/admin/dashboard");
}

export async function createAccountAction(raw: { role: "admin" | "brand"; brand_id?: string; email: string; name: string; phone?: string }): Promise<ActionResult> {
  const s = await admin();
  const role = raw.role === "admin" ? "admin" : "brand";
  const denied = guardTarget(s, { role });
  if (denied) return { ok: false, message: denied };
  const email = String(raw.email ?? "").trim().toLowerCase();
  const name = String(raw.name ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
  const phone = String(raw.phone ?? "").trim().slice(0, 30) || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return { ok: false, message: "이메일 주소를 확인해 주세요." };
  if (!name) return { ok: false, message: role === "admin" ? "직원 이름을 입력해 주세요." : "담당자 이름을 입력해 주세요." };
  try {
    let brandId: string | null = null;
    if (role === "brand") {
      const b = await getBrand(String(raw.brand_id ?? ""));
      if (!b) throw new Error("브랜드를 찾을 수 없어요.");
      brandId = b.id;
    }
    const pw = tempPassword();
    const u = await insertUser({ email, name, phone, role, brand_id: brandId, password_hash: await hashPassword(pw), must_change_password: true });
    await logEvent({ ...actorOf(s), action: ev({ role }, "account_created", "staff_created"), brand_id: brandId, product_id: null, detail: { email, name, role } });
    refreshAccounts();
    return { ok: true, message: `${u.name}(${u.email}) ${role === "admin" ? "직원" : "담당자"} 계정을 만들었어요.`, password: pw };
  } catch (e) {
    const m = e instanceof Error && e.message.includes("중복") ? "이미 같은 이메일로 만든 계정이 있어요. (직원·브랜드 계정 전체에서 이메일은 하나만 쓸 수 있어요)" : undefined;
    return m ? { ok: false, message: m } : err(e);
  }
}

async function loadTarget(userId: string) {
  const u = await getUserById(userId);
  if (!u) throw new Error("계정을 찾을 수 없어요. 이미 삭제됐을 수 있어요.");
  return u;
}

export async function resetPasswordAction(userId: string): Promise<ActionResult> {
  const s = await admin();
  try {
    const u = await loadTarget(userId);
    const denied = guardTarget(s, u);
    if (denied) return { ok: false, message: denied };
    if (u.id === s.userId) return { ok: false, message: "내 비밀번호는 [비밀번호 변경]에서 바꿔 주세요." };
    const pw = tempPassword();
    await patchUser(userId, { password_hash: await hashPassword(pw), must_change_password: true, failed_attempts: 0, locked_until: null, token_version: u.token_version + 1 });
    await logEvent({ ...actorOf(s), action: ev(u, "password_reset", "staff_password_reset"), brand_id: u.brand_id, product_id: null, detail: { email: u.email, name: u.name } });
    refreshAccounts();
    return { ok: true, message: `${u.name}(${u.email})의 임시 비밀번호를 새로 만들었어요. 그 계정의 기존 로그인은 모두 풀렸어요.`, password: pw };
  } catch (e) {
    return err(e);
  }
}

export async function setAccountActiveAction(userId: string, active: boolean): Promise<ActionResult> {
  const s = await admin();
  if (userId === s.userId) return { ok: false, message: "지금 로그인한 내 계정은 중지할 수 없어요." };
  try {
    const u = await loadTarget(userId);
    const denied = guardTarget(s, u);
    if (denied) return { ok: false, message: denied };
    await patchUser(userId, { active, token_version: u.token_version + 1, ...(active ? { failed_attempts: 0, locked_until: null } : {}) });
    await logEvent({
      ...actorOf(s),
      action: active ? ev(u, "account_activated", "staff_activated") : ev(u, "account_deactivated", "staff_deactivated"),
      brand_id: u.brand_id,
      product_id: null,
      detail: { email: u.email, name: u.name },
    });
  } catch (e) {
    return err(e);
  }
  refreshAccounts();
  return { ok: true, message: active ? "다시 쓸 수 있게 했어요." : "사용을 중지했어요. 그 계정은 바로 로그아웃돼요." };
}

export async function deleteAccountAction(userId: string): Promise<ActionResult> {
  const s = await admin();
  if (userId === s.userId) return { ok: false, message: "지금 로그인한 내 계정은 삭제할 수 없어요." };
  try {
    const u = await loadTarget(userId);
    const denied = guardTarget(s, u);
    if (denied) return { ok: false, message: denied };
    await deleteUser(userId);
    await logEvent({ ...actorOf(s), action: ev(u, "account_deleted", "staff_deleted"), brand_id: u.brand_id, product_id: null, detail: { email: u.email, name: u.name } });
  } catch (e) {
    return err(e);
  }
  refreshAccounts();
  return { ok: true, message: "계정을 삭제했어요." };
}
