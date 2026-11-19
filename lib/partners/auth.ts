import "server-only";
import { createHmac, randomBytes, randomInt, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserById } from "./db";
import type { PartnerUser } from "./model";

// partners 사이트 로그인
// - 계정은 관리자가 발급(임시 비밀번호) → 첫 로그인 때 새 비밀번호로 변경
// - 비밀번호는 scrypt 해시로만 저장, 5번 틀리면 15분 잠금
// - 세션은 서명된 쿠키(12시간). 비밀번호 변경·초기화·비활성화 시 token_version이 올라가 기존 세션은 무효
// - '대표 관리자' 로그인(관리 사이트 전용): 관리자 비밀번호(ADMIN_PASSWORD)로 들어오는 최상위 관리자 (계정 없이)

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
export const COOKIE = "vt_partners";
const TTL = 60 * 60 * 12;
export const MAX_FAILS = 5;
export const LOCK_MINUTES = 15;

export type Session = {
  kind: "master" | "user";
  role: "admin" | "brand";
  userId: string | null;
  brandId: string | null;
  name: string;
  email: string | null;
  mustChange: boolean;
};

export function partnersConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY && process.env.ADMIN_PASSWORD);
}

function key() {
  return `partners::${process.env.SUPABASE_SECRET_KEY}::${process.env.ADMIN_PASSWORD}`;
}
function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

// ---------- 비밀번호 ----------
const N = 16384;
export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const dk = await scrypt(pw.normalize("NFKC"), salt, 32, { N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${salt.toString("base64url")}$${dk.toString("base64url")}`;
}
export async function verifyPassword(pw: string, stored: string) {
  const [alg, n, s, h] = stored.split("$");
  if (alg !== "scrypt" || !s || !h) return false;
  const dk = await scrypt(pw.normalize("NFKC"), Buffer.from(s, "base64url"), 32, { N: Number(n), r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return safeEqual(dk.toString("base64url"), h);
}
/** 헷갈리는 글자(0/O, 1/l/I)를 뺀 12자리 임시 비밀번호 */
export function tempPassword() {
  const A = "abcdefghjkmnpqrstuvwxyz";
  const D = "23456789";
  const all = A + A.toUpperCase() + D;
  let s = "";
  for (let i = 0; i < 12; i++) s += all[randomInt(all.length)];
  // 숫자·소문자·대문자 최소 1개씩
  return D[randomInt(D.length)] + s.slice(1, 11) + A.toUpperCase()[randomInt(A.length)];
}
export function passwordProblem(pw: string, email?: string) {
  if (pw.length < 10) return "비밀번호는 10자 이상이어야 해요.";
  if (pw.length > 128) return "비밀번호가 너무 길어요.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "영문과 숫자를 함께 넣어 주세요.";
  if (email && pw.toLowerCase().includes(email.split("@")[0].toLowerCase()) && email.split("@")[0].length >= 4) return "아이디(이메일)가 들어간 비밀번호는 쓸 수 없어요.";
  if (/^(.)\1+$/.test(pw) || /(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf)/i.test(pw)) return "너무 쉬운 비밀번호예요.";
  return null;
}
export function checkMasterPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const h = (s: string) => createHmac("sha256", "vt-partners-master").update(s).digest("hex");
  return safeEqual(h(input), h(expected));
}

// ---------- 세션 ----------
// 두 사이트가 같은 계정 표를 쓰지만 쿠키·서명 범위는 분리합니다.
//  - partners: partners.vigtiger.com 브랜드 담당자 (vt_partners)
//  - admin:    admin.vigtiger.com 관리자 — 대표 관리자(비밀번호) 또는 직원 계정 (vt_admin)
export type Scope = "partners" | "admin";
const COOKIES: Record<Scope, string> = { partners: COOKIE, admin: "vt_admin" };
const signFor = (scope: Scope, payload: string) => createHmac("sha256", `${key()}::${scope}`).update(payload).digest("base64url");

export async function setSession(scope: Scope, s: { kind: "master" } | { kind: "user"; userId: string; tv: number }) {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const payload = s.kind === "master" ? `m.-.0.${exp}` : `u.${s.userId}.${s.tv}.${exp}`;
  (await cookies()).set(COOKIES[scope], `${payload}.${signFor(scope, payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL,
  });
}
export async function clearSession(scope: Scope) {
  (await cookies()).delete(COOKIES[scope]);
}

export async function getSession(scope: Scope): Promise<Session | null> {
  if (!partnersConfigured()) return null;
  const raw = (await cookies()).get(COOKIES[scope])?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  if (i < 0) return null;
  const payload = raw.slice(0, i);
  if (!safeEqual(raw.slice(i + 1), signFor(scope, payload))) return null;
  const [kind, id, tv, exp] = payload.split(".");
  if (!(Number(exp) > Date.now() / 1000)) return null;
  if (kind === "m") {
    if (scope !== "admin") return null; // 대표 관리자는 관리 사이트에서만
    return { kind: "master", role: "admin", userId: null, brandId: null, name: "대표 관리자", email: null, mustChange: false };
  }
  if (kind !== "u") return null;
  let u: (PartnerUser & { password_hash?: string }) | null = null;
  try {
    u = await getUserById(id);
  } catch {
    return null;
  }
  if (!u || !u.active || u.token_version !== Number(tv)) return null;
  // 관리 사이트에는 관리자 계정만, 파트너 사이트에는 브랜드 계정만
  if ((scope === "admin") !== (u.role === "admin")) return null;
  if (u.role === "brand" && !u.brand_id) return null;
  return { kind: "user", role: u.role, userId: u.id, brandId: u.brand_id, name: u.name, email: u.email, mustChange: u.must_change_password };
}

/** partners.vigtiger.com 페이지·액션 보호 (브랜드 담당자) */
export async function requireBrand(opts: { allowMustChange?: boolean } = {}) {
  const s = await getSession("partners");
  if (!s) redirect("/login");
  if (s.mustChange && !opts.allowMustChange) redirect("/password");
  return s as Session & { brandId: string };
}

/** admin.vigtiger.com 페이지·액션 보호 (관리자) */
export async function requireAdmin(opts: { allowMustChange?: boolean } = {}) {
  const s = await getSession("admin");
  if (!s) redirect("/login");
  if (s.mustChange && !opts.allowMustChange) redirect("/password");
  return s;
}

export const actorOf = (s: Session) => ({ actor_id: s.userId, actor_label: s.email ? `${s.name} (${s.email})` : s.name });
