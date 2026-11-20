import type { Metadata } from "next";
import { requireBrand } from "@/lib/partners/auth";
import { getBrand, listProducts } from "@/lib/partners/db";
import ProductBoard from "@/components/partners/ProductBoard";
import PTop, { PHead } from "../PTop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "제품 리스트" };

export default async function BrandCatalog() {
  const s = await requireBrand();
  const b = await getBrand(s.brandId);
  const products = b ? (await listProducts({ brandId: b.id, status: "approved" })).filter((p) => p.to_visible !== false) : [];
  return (
    <>
      <PTop s={s} current="catalog" brandName={b?.name_ko} />
      <main className="a-wrap">
        <PHead
          crumb="제품 관리"
          title="제품 리스트"
          desc="크리에이터에게 보여지는 우리 브랜드의 제품이에요 (게시 중 + TO 노출 켠 제품). 승인 대기·수정 요청 중인 내용은 승인된 뒤에 반영돼요."
          actions={<a className="a-btn" href="/catalog/print">인쇄/PDF로 보기</a>}
        />
        {b && <ProductBoard brands={[b]} products={products} showBrandHead={false} />}
      </main>
    </>
  );
}
