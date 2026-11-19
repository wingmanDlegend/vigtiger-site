import type { Metadata } from "next";
import { requireAdmin } from "@/lib/partners/auth";
import PasswordForm from "@/components/partners/PasswordForm";
import AdminTop from "../AdminTop";
import { PageHead } from "../SubNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "비밀번호 변경" };

export default async function AdminPassword() {
  const s = await requireAdmin({ allowMustChange: true });
  if (s.mustChange) {
    return (
      <main className="a-login p-login">
        <div className="a-card a-login-box p-login-box">
          <div className="p-login-head">
            <span className="a-mark" aria-hidden="true">V</span>
            <div>
              <h1>새 비밀번호 만들기</h1>
              <p className="a-sub">{s.name}님, 처음 로그인하셨네요. 받으신 임시 비밀번호 대신 쓸 새 비밀번호를 정해 주세요.</p>
            </div>
          </div>
          <PasswordForm site="admin" />
        </div>
      </main>
    );
  }
  return (
    <>
      <AdminTop current="password" />
      <main className="a-wrap">
        <PageHead crumb="계정" title="비밀번호 변경" desc="바꾸면 다른 기기에서 로그인된 상태도 모두 풀려요." />
        <section className="a-card a-sec p-narrow">
          {s.kind === "master" ? (
            <p className="a-sub">대표 관리자 비밀번호는 Vercel 환경변수 ADMIN_PASSWORD에서 바꿀 수 있어요.</p>
          ) : (
            <PasswordForm site="admin" />
          )}
        </section>
      </main>
    </>
  );
}
