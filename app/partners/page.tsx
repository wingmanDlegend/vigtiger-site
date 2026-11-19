import { redirect } from "next/navigation";
import { getSession } from "@/lib/partners/auth";

export const dynamic = "force-dynamic";

// partners.vigtiger.com 첫 화면: 로그인 여부에 따라 이동
export default async function PartnersHome() {
  const s = await getSession("partners");
  if (!s) redirect("/login");
  redirect(s.mustChange ? "/password" : "/my");
}
