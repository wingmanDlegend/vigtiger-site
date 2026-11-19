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
// - '대표 관리자' 로그인: 기존 관리자 비밀번호(ADMIN_PASSWORD)로 들어오는 최상위 관리자 (계정 없이)

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
const sign = (payload: string) => createHmac("sha256", key()).update(payload).digest("base64url");
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
export async function setSession(s: { kind: "master" } | { kind: "user"; userId: string; tv: number }) {
  const exp = Math.floor(Date.now() / 1000) + TTL;
  const payload = s.kind === "master" ? `m.-.0.${exp}` : `u.${s.userId}.${s.tv}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL,
  });
}
export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  if (!partnersConfigured()) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  if (i < 0) return null;
  const payload = raw.slice(0, i);
  if (!safeEqual(raw.slice(i + 1), sign(payload))) return null;
  const [kind, id, tv, exp] = payload.split(".");
  if (!(Number(exp) > Date.now() / 1000)) return null;
  if (kind === "m") return { kind: "master", role: "admin", userId: null, brandId: null, name: "대표 관리자", email: null, mustChange: false };
  if (kind !== "u") return null;
  let u: (PartnerUser & { password_hash?: string }) | null = null;
  try {
    u = await getUserById(id);
  } catch {
    return null;
  }
  if (!u || !u.active || u.token_version !== Number(tv)) return null;
  return { kind: "user", role: u.role, userId: u.id, brandId: u.brand_id, name: u.name, email: u.email, mustChange: u.must_change_password };
}

/** 페이지·액션 보호 */
export async function requireSession(opts: { role?: "admin" | "brand"; allowMustChange?: boolean } = {}) {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.mustChange && !opts.allowMustChange) redirect("/password");
  if (opts.role === "admin" && s.role !== "admin") redirect("/");
  if (opts.role === "brand" && (s.role !== "brand" || !s.brandId)) redirect("/");
  return s;
}

export const actorOf = (s: Session) => ({ actor_id: s.userId, actor_label: s.email ? `${s.name} (${s.email})` : s.name });
