"use server";

import { redirect } from "next/navigation";
import {
  LOCK_MINUTES,
  actorOf,
  checkMasterPassword,
  clearSession,
  getSession,
  hashPassword,
  passwordProblem,
  requireAdmin,
  requireBrand,
  setSession,
  verifyPassword,
  type Scope,
  type Session,
} from "@/lib/partners/auth";
import { getPasswordHash, getUserForLogin, logEvent, loginFailed, patchUser } from "@/lib/partners/db";
import { uploadImage } from "@/lib/partners/storage";

// 로그인·로그아웃·비밀번호 변경·이미지 업로드 — 파트너 사이트와 관리 사이트가 함께 씁니다.
export type FormState = { ok?: boolean; message?: string } | null;

// 존재하지 않는 계정에도 같은 시간이 걸리도록 쓰는 가짜 해시
const DUMMY = "scrypt$16384$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

async function passwordLogin(scope: Scope, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const pw = String(fd.get("password") ?? "").slice(0, 200);
  if (!email || !pw) return { message: "이메일과 비밀번호를 입력해 주세요." };
  const generic = { message: "이메일 또는 비밀번호가 맞지 않아요." };
  let u;
  try {
    u = await getUserForLogin(email);
  } catch {
    return { message: "잠시 후 다시 시도해 주세요. (서버 연결 오류)" };
  }
  if (!u) {
    await verifyPassword(pw, DUMMY).catch(() => false);
    return generic;
  }
  if (u.locked_until && new Date(u.locked_until) > new Date()) {
    return { message: `비밀번호를 여러 번 틀려 잠시 잠겼어요. ${LOCK_MINUTES}분 뒤에 다시 시도하거나 관리자에게 비밀번호 초기화를 요청해 주세요.` };
  }
  const ok = await verifyPassword(pw, u.password_hash).catch(() => false);
  if (!ok) {
    const locked = await loginFailed(u.id).catch(() => false);
    if (locked) await logEvent({ actor_id: u.id, actor_label: u.email, action: "login_locked", brand_id: u.brand_id, product_id: null, detail: null });
    return generic;
  }
  if (!u.active) return { message: "사용이 중지된 계정이에요. 관리자에게 문의해 주세요." };
  // 계정 종류와 사이트가 맞아야 함 (비밀번호는 맞았으니 안내)
  if (scope === "admin" && u.role !== "admin") return { message: "브랜드 담당자 계정이에요. TO 파트너스(partners.vigtiger.com)에서 로그인해 주세요." };
  if (scope === "partners" && u.role !== "brand") return { message: "대범한사람들 직원 계정이에요. 업무 관리 시스템(admin.vigtiger.com)에서 로그인해 주세요." };
  await patchUser(u.id, { failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() });
  await setSession(scope, { kind: "user", userId: u.id, tv: u.token_version });
  await logEvent({ actor_id: u.id, actor_label: u.email, action: "login", brand_id: u.brand_id, product_id: null, detail: { site: scope } });
  redirect(u.must_change_password ? "/password" : scope === "admin" ? "/" : "/my");
}

export async function brandLoginAction(_: FormState, fd: FormData) {
  return passwordLogin("partners", fd);
}
export async function adminLoginAction(_: FormState, fd: FormData) {
  return passwordLogin("admin", fd);
}

export async function masterLoginAction(_: FormState, fd: FormData): Promise<FormState> {
  const pw = String(fd.get("password") ?? "").slice(0, 200);
  if (!checkMasterPassword(pw)) {
    await new Promise((r) => setTimeout(r, 600));
    return { message: "관리자 비밀번호가 맞지 않아요." };
  }
  await setSession("admin", { kind: "master" });
  await logEvent({ actor_id: null, actor_label: "대표 관리자", action: "login", brand_id: null, product_id: null, detail: { site: "admin" } });
  redirect("/");
}

export async function brandLogoutAction() {
  await clearSession("partners");
  redirect("/login");
}
export async function adminLogoutAction() {
  await clearSession("admin");
  redirect("/login");
}

async function changePassword(scope: Scope, s: Session, fd: FormData): Promise<FormState> {
  if (s.kind !== "user" || !s.userId) return { message: "대표 관리자 비밀번호는 Vercel 환경변수(ADMIN_PASSWORD)에서 바꿔요." };
  const cur = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const again = String(fd.get("again") ?? "");
  const hash = await getPasswordHash(s.userId);
  if (!hash || !(await verifyPassword(cur, hash))) return { message: "지금 비밀번호가 맞지 않아요." };
  if (next !== again) return { message: "새 비밀번호 두 칸이 서로 달라요." };
  const p = passwordProblem(next, s.email ?? undefined);
  if (p) return { message: p };
  if (next === cur) return { message: "지금과 다른 비밀번호를 써 주세요." };
  const u = await patchUser(s.userId, { password_hash: await hashPassword(next), must_change_password: false, token_version: Math.floor(Date.now() / 1000) % 2_000_000_000 });
  await setSession(scope, { kind: "user", userId: u.id, tv: u.token_version });
  await logEvent({ ...actorOf(s), action: "password_changed", brand_id: s.brandId, product_id: null, detail: null });
  redirect(scope === "admin" ? "/?pw=1" : "/my?pw=1");
}

export async function brandChangePasswordAction(_: FormState, fd: FormData) {
  return changePassword("partners", await requireBrand({ allowMustChange: true }), fd);
}
export async function adminChangePasswordAction(_: FormState, fd: FormData) {
  return changePassword("admin", await requireAdmin({ allowMustChange: true }), fd);
}

/** 이미지 올리기 (로그인한 사용자만) — 올린 주소를 돌려줌. 요청이 온 사이트의 세션으로 확인 */
export async function uploadImageAction(fd: FormData): Promise<{ ok: boolean; url?: string; message?: string }> {
  const s = (await getSession("admin")) ?? (await getSession("partners"));
  if (!s || s.mustChange) return { ok: false, message: "다시 로그인해 주세요." };
  const file = fd.get("file");
  const folder = fd.get("folder") === "brands" ? "brands" : "products";
  try {
    const url = await uploadImage(file as File, folder);
    await logEvent({ ...actorOf(s), action: "image_uploaded", brand_id: s.brandId, product_id: null, detail: { url } });
    return { ok: true, url };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "올리지 못했어요." };
  }
}
