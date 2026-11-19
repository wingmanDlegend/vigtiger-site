import type { Metadata } from "next";
import { requireBrand } from "@/lib/partners/auth";
import { getBrand, listProducts } from "@/lib/partners/db";
import { CatalogDoc } from "@/components/partners/Catalog";
import PrintBar from "@/components/partners/PrintBar";
import PTop from "../PTop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "제품 리스트 출력" };

export default async function BrandCatalog() {
  const s = await requireBrand();
  const b = await getBrand(s.brandId);
  const brands = b ? [b] : [];
  const products = b ? await listProducts({ brandId: b.id, status: "approved" }) : [];
  return (
    <>
      <PTop s={s} current="catalog" brandName={b?.name_ko} />
      <main className="a-wrap cat-wrap">
        <PrintBar admin={false} brands={[]} current={{ brand: "", category: "" }} count={{ brands: brands.length, products: products.length }} />
        <CatalogDoc brands={brands} products={products} />
      </main>
    </>
  );
}
