import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// 관리자 로그인: Vercel 환경변수 ADMIN_PASSWORD 와 비교하고,
// 성공하면 서명된 쿠키(12시간 유효)를 발급합니다.
export const COOKIE = "vt_admin";
const TTL_SECONDS = 60 * 60 * 12;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.SUPABASE_SECRET_KEY && process.env.SUPABASE_URL);
}

function key() {
  // 비밀번호나 Supabase 비밀 키가 바뀌면 기존 로그인은 모두 무효가 됩니다.
  return `${process.env.ADMIN_PASSWORD}::${process.env.SUPABASE_SECRET_KEY}`;
}

function sign(payload: string) {
  return createHmac("sha256", key()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  // 길이와 무관하게 비교 시간이 같도록 해시끼리 비교
  const h = (s: string) => createHmac("sha256", "vt-admin-pw").update(s).digest("hex");
  return safeEqual(h(input), h(expected));
}

export function createSessionValue() {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `admin.${exp}`;
  return { value: `${payload}.${sign(payload)}`, maxAge: TTL_SECONDS };
}

export async function isAuthed() {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const i = raw.lastIndexOf(".");
  if (i < 0) return false;
  const payload = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  if (!safeEqual(sig, sign(payload))) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && exp > Date.now() / 1000;
}
