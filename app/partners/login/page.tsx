import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, partnersConfigured } from "@/lib/partners/auth";
import LoginForms from "@/components/partners/LoginForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage() {
  const s = await getSession("partners");
  if (s) redirect(s.mustChange ? "/password" : "/my");
  return (
    <main className="a-login p-login">
      <div className="a-card a-login-box p-login-box">
        <div className="p-login-head">
          <span className="a-mark" aria-hidden="true">TO</span>
          <div>
            <h1>TO 파트너스</h1>
            <p className="a-sub">티오(TO) 대여·협찬 제품을 등록하고 관리하는 브랜드 파트너 전용 공간이에요.</p>
          </div>
        </div>
        {partnersConfigured() ? (
          <LoginForms site="partners" />
        ) : (
          <p className="a-setup">서버 설정이 아직 끝나지 않았어요. 관리자에게 문의해 주세요.</p>
        )}
        <p className="p-login-foot a-sub">
          계정은 대범한사람들 담당자가 발급해 드려요. 계정이 없거나 비밀번호를 잊었다면 담당자에게 요청해 주세요.
        </p>
      </div>
    </main>
  );
}
