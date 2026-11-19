import "server-only";
import { getSession, partnersConfigured } from "@/lib/partners/auth";

// 관리 사이트(admin.vigtiger.com) 로그인 확인
// 대표 관리자(ADMIN_PASSWORD) 또는 관리자가 발급한 직원 계정 — 세션 처리는 lib/partners/auth.ts 에서 함께 합니다.

export function adminConfigured() {
  return partnersConfigured();
}

/** 로그인돼 있고, 첫 로그인 비밀번호 변경까지 마친 관리자인지 */
export async function isAuthed() {
  const s = await getSession("admin");
  return Boolean(s && !s.mustChange);
}

export async function adminSession() {
  return getSession("admin");
}
