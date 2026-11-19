import type { Metadata } from "next";
import { requireAdmin } from "@/lib/partners/auth";
import { listBrands, listProducts } from "@/lib/partners/db";
import AdminTop from "@/app/admin/AdminTop";
import { PageHead as PHead } from "@/app/admin/SubNav";
import ProductForm from "@/components/partners/ProductForm";
import { adminSaveProductAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "제품 추가" };

export default async function AdminNewProduct({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const s = await requireAdmin();
  const sp = await searchParams;
  const brands = await listBrands();
  const brand = brands.find((b) => b.id === sp.brand) ?? brands[0];
  const siblings = brand ? await listProducts({ brandId: brand.id }) : [];
  const sections = [...new Set(siblings.map((x) => x.section).filter(Boolean) as string[])];
  return (
    <>
      <AdminTop current="to-products" />
      <main className="a-wrap">
        <PHead crumb="티오 파트너스 · 제품" title="제품 추가" desc="관리자가 추가한 제품은 바로 게시돼요. 일련번호를 비워 두면 브랜드 코드 다음 번호가 자동으로 붙어요." />
        {brands.length === 0 ? (
          <p className="a-note">먼저 브랜드를 추가해 주세요.</p>
        ) : (
          <ProductForm
            submit={adminSaveProductAction.bind(null, null)}
            sections={sections}
            submitLabel="추가"
            cancelHref="/to/products"
            admin={{
              extra: { brand_id: brand.id, serial: "", status: "approved", sort: "" },
              brands: brands.map((b) => ({ id: b.id, label: `${b.name_ko} (${b.code})` })),
            }}
          />
        )}
      </main>
    </>
  );
}
