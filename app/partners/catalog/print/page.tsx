import type { Metadata } from "next";
import { requireBrand } from "@/lib/partners/auth";
import { getBrand, listProducts } from "@/lib/partners/db";
import { CatalogDoc } from "@/components/partners/Catalog";
import PrintBar from "@/components/partners/PrintBar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "인쇄 / PDF 보기" };

export default async function BrandCatalogPrint() {
  const s = await requireBrand();
  const b = await getBrand(s.brandId);
  const products = b ? await listProducts({ brandId: b.id, status: "approved" }) : [];
  return (
    <main className="a-wrap cat-wrap cat-print">
      <PrintBar backHref="/catalog" count={{ brands: b ? 1 : 0, products: products.length }} scope={b?.name_ko ?? "내 브랜드"} />
      {b && <CatalogDoc brands={[b]} products={products} />}
    </main>
  );
}
