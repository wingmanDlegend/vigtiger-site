import type { Metadata } from "next";
import { requireSession } from "@/lib/partners/auth";
import { getBrand } from "@/lib/partners/db";
import { BRAND_FIELDS, CATEGORY_LABEL, brandToProfile, fmtDate } from "@/lib/partners/model";
import PTop, { PHead } from "../../PTop";
import BrandProfileForm from "../../BrandProfileForm";
import { cancelProfileRequestAction, updateProfileAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "브랜드 정보" };

export default async function BrandProfilePage() {
  const s = await requireSession({ role: "brand" });
  const b = await getBrand(s.brandId!);
  if (!b) return null;
  const initial = { ...brandToProfile(b), ...(b.pending_changes ?? {}) };
  const asked = b.pending_changes ? BRAND_FIELDS.filter((f) => f.key in (b.pending_changes ?? {})).map((f) => f.label) : [];
  return (
    <>
      <PTop s={s} current="b-profile" brandName={b.name_ko} />
      <main className="a-wrap">
        <PHead
          crumb={`${CATEGORY_LABEL[b.category]} · 브랜드 코드 ${b.code}`}
          title={`${b.name_ko} 브랜드 정보`}
          desc="제품 리스트의 브랜드 첫 장에 들어가는 내용이에요. 고치면 관리자 승인 후 반영돼요. (브랜드 이름·분류·코드는 담당자에게 요청해 주세요.)"
        />
        {b.pending_changes && (
          <p className="a-note" role="note">
            {fmtDate(b.change_requested_at)}에 수정을 요청했어요 ({asked.join(", ")}). 승인 전까지는 지금 내용이 그대로 보여요.
          </p>
        )}
        {b.reject_reason && !b.pending_changes && <p className="a-error" role="note">지난 수정 요청이 반려됐어요: {b.reject_reason}</p>}
        <BrandProfileForm
          initial={initial}
          submit={updateProfileAction}
          submitLabel="수정 요청"
          cancel={b.pending_changes ? { label: "수정 요청 취소", action: cancelProfileRequestAction } : undefined}
        />
      </main>
    </>
  );
}
