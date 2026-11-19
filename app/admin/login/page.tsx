import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminConfigured, adminSession } from "@/lib/admin/auth";
import LoginForms from "@/components/partners/LoginForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage() {
  const s = await adminSession();
  if (s) redirect(s.mustChange ? "/password" : "/");
  return (
    <main className="a-login p-login">
      <div className="a-card a-login-box p-login-box">
        <div className="p-login-head">
          <span className="a-mark" aria-hidden="true">V</span>
          <div>
            <h1>대범한사람들 업무 관리</h1>
            <p className="a-sub">제휴 신청 · 공동구매 · 티오 파트너스 · 콘텐츠를 한곳에서 관리해요.</p>
          </div>
        </div>
        {adminConfigured() ? (
          <LoginForms site="admin" />
        ) : (
          <p className="a-setup">
            관리 사이트 설정이 아직 끝나지 않았어요. Vercel 환경변수에 <code>ADMIN_PASSWORD</code>, <code>SUPABASE_URL</code>, <code>SUPABASE_SECRET_KEY</code>가 있는지 확인해 주세요.
          </p>
        )}
        <p className="p-login-foot a-sub">직원 계정은 대표 관리자가 [설정 › 관리자 계정]에서 만들어요.</p>
      </div>
    </main>
  );
}
