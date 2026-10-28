import { redirect } from "next/navigation";
import { adminConfigured, isAuthed } from "@/lib/admin/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthed()) redirect("/admin");
  const ready = adminConfigured();
  return (
    <main className="a-login">
      <div className="a-card a-login-box">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="a-mark" aria-hidden="true">V</span>
          <h1 style={{ fontSize: 18, fontWeight: 800 }}>대범한사람들 신청 관리</h1>
        </div>
        {ready ? (
          <LoginForm />
        ) : (
          <p className="a-setup">
            관리자 페이지 설정이 아직 끝나지 않았어요. Vercel 프로젝트 환경변수에 <code>ADMIN_PASSWORD</code>와{" "}
            <code>SUPABASE_SECRET_KEY</code>를 추가하고 다시 배포해 주세요.
          </p>
        )}
      </div>
    </main>
  );
}
