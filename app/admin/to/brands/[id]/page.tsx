import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/partners/auth";
import { getBrand, listProducts, listUsers } from "@/lib/partners/db";
import { brandToProfile } from "@/lib/partners/model";
import AdminTop from "@/app/admin/AdminTop";
import { PageHead as PHead } from "@/app/admin/SubNav";
import BrandProfileForm from "@/components/partners/BrandProfileForm";
import { adminSaveBrandAction } from "../../actions";
import AccountsPanel from "../../AccountsPanel";
import BrandDanger from "./BrandDanger";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "브랜드" };

export default async function AdminBrand({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const s = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const b = await getBrand(id);
  if (!b) notFound();
  const [users, products] = await Promise.all([listUsers(b.id), listProducts({ brandId: b.id })]);
  return (
    <>
      <AdminTop current="to-brands" />
      <main className="a-wrap">
        <PHead
          crumb="티오 파트너스 · 브랜드·계정"
          title={b.name_ko}
          desc={`제품 ${products.length}개 · 게시 중 ${products.filter((p) => p.status === "approved").length}개`}
          actions={
            <span className="p-actions">
              <a className="a-btn is-ghost" href={`/to/products?brand=${b.id}`}>제품 보기</a>
              <a className="a-btn is-ghost" href={`/to/catalog?brand=${b.id}`}>이 브랜드 제품 리스트</a>
            </span>
          }
        />
        {sp.created && <p className="a-saved" role="status">브랜드를 추가했어요. 아래에서 담당자 계정을 발급해 주세요.</p>}
        {b.pending_changes && (
          <p className="a-note" role="note">
            담당자가 브랜드 정보 수정을 요청했어요. <a href="/to/review">승인 대기</a>에서 비교하고 처리할 수 있어요. (여기서 저장하면 요청과 별개로 바로 반영돼요.)
          </p>
        )}
        <AccountsPanel role="brand" brandId={b.id} brandName={b.name_ko} users={users} />
        <BrandProfileForm
          initial={brandToProfile(b)}
          basics={{ name_ko: b.name_ko, code: b.code, category: b.category, sort: String(b.sort), active: b.active }}
          submit={adminSaveBrandAction.bind(null, b.id)}
          submitLabel="저장"
        />
        <BrandDanger id={b.id} name={b.name_ko} />
      </main>
    </>
  );
}
