import { redirect } from "next/navigation";
import { getSession } from "@/lib/partners/auth";

export const dynamic = "force-dynamic";

// partners.vigtiger.com 첫 화면: 로그인 여부·역할에 따라 이동
export default async function PartnersHome() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.mustChange) redirect("/password");
  redirect(s.role === "admin" ? "/admin" : "/my");
}
