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
  requireSession,
  setSession,
  verifyPassword,
} from "@/lib/partners/auth";
import { getPasswordHash, getUserForLogin, logEvent, loginFailed, patchUser } from "@/lib/partners/db";
import { uploadImage } from "@/lib/partners/storage";

export type FormState = { ok?: boolean; message?: string } | null;

// 존재하지 않는 계정에도 같은 시간이 걸리도록 쓰는 가짜 해시
const DUMMY = "scrypt$16384$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
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
  await patchUser(u.id, { failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() });
  await setSession({ kind: "user", userId: u.id, tv: u.token_version });
  await logEvent({ actor_id: u.id, actor_label: u.email, action: "login", brand_id: u.brand_id, product_id: null, detail: null });
  redirect(u.must_change_password ? "/password" : u.role === "admin" ? "/admin" : "/my");
}

export async function masterLoginAction(_: FormState, fd: FormData): Promise<FormState> {
  const pw = String(fd.get("password") ?? "").slice(0, 200);
  if (!checkMasterPassword(pw)) {
    await new Promise((r) => setTimeout(r, 600));
    return { message: "관리자 비밀번호가 맞지 않아요." };
  }
  await setSession({ kind: "master" });
  await logEvent({ actor_id: null, actor_label: "대표 관리자", action: "login", brand_id: null, product_id: null, detail: null });
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const s = await requireSession({ allowMustChange: true });
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
  await setSession({ kind: "user", userId: u.id, tv: u.token_version });
  await logEvent({ ...actorOf(s), action: "password_changed", brand_id: s.brandId, product_id: null, detail: null });
  redirect(s.role === "admin" ? "/admin?pw=1" : "/my?pw=1");
}

/** 이미지 올리기 (로그인한 사용자만) — 올린 주소를 돌려줌 */
export async function uploadImageAction(fd: FormData): Promise<{ ok: boolean; url?: string; message?: string }> {
  const s = await getSession();
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
