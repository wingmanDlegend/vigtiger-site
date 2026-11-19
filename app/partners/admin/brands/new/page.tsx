import type { Metadata } from "next";
import { requireSession } from "@/lib/partners/auth";
import PTop, { PHead } from "../../../PTop";
import BrandProfileForm from "../../../BrandProfileForm";
import { adminSaveBrandAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "브랜드 추가" };

export default async function AdminNewBrand() {
  const s = await requireSession({ role: "admin" });
  return (
    <>
      <PTop s={s} current="a-brands" />
      <main className="a-wrap">
        <PHead crumb="브랜드·계정" title="브랜드 추가" desc="저장한 다음 화면에서 담당자 계정을 발급할 수 있어요." />
        <BrandProfileForm
          initial={{ name_en: "", highlights: [], description: "", notice: "", hero_url: "" }}
          basics={{ name_ko: "", code: "", category: "", sort: "", active: true }}
          submit={adminSaveBrandAction.bind(null, null)}
          submitLabel="브랜드 추가"
        />
      </main>
    </>
  );
}
