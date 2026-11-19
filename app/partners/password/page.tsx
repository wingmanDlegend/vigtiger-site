import type { Metadata } from "next";
import { getBrand } from "@/lib/partners/db";
import { requireBrand } from "@/lib/partners/auth";
import PTop, { PHead } from "../PTop";
import PasswordForm from "@/components/partners/PasswordForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "비밀번호 변경" };

export default async function PasswordPage() {
  const s = await requireBrand({ allowMustChange: true });
  if (s.mustChange) {
    return (
      <main className="a-login p-login">
        <div className="a-card a-login-box p-login-box">
          <div className="p-login-head">
            <span className="a-mark" aria-hidden="true">TO</span>
            <div>
              <h1>새 비밀번호 만들기</h1>
              <p className="a-sub">{s.name}님, 처음 로그인하셨네요. 받으신 임시 비밀번호 대신 쓸 새 비밀번호를 정해 주세요.</p>
            </div>
          </div>
          <PasswordForm site="partners" />
        </div>
      </main>
    );
  }
  const brand = s.brandId ? await getBrand(s.brandId) : null;
  return (
    <>
      <PTop s={s} current="password" brandName={brand?.name_ko} />
      <main className="a-wrap">
        <PHead crumb="계정" title="비밀번호 변경" desc="바꾸면 다른 기기에서 로그인된 상태도 모두 풀려요." />
        <section className="a-card a-sec p-narrow">
          <PasswordForm site="partners" />
        </section>
      </main>
    </>
  );
}
