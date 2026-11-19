import type { Metadata } from "next";
import { requireAdmin } from "@/lib/partners/auth";
import { listBrands, listProducts } from "@/lib/partners/db";
import { applyFilter, filterQuery, readFilter } from "@/lib/partners/catalog";
import { CATEGORY_LABEL } from "@/lib/partners/model";
import { CatalogDoc } from "@/components/partners/Catalog";
import PrintBar from "@/components/partners/PrintBar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "인쇄 / PDF 보기" };

export default async function AdminCatalogPrint({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin();
  const f = readFilter(await searchParams);
  const [brandsAll, productsAll] = await Promise.all([listBrands(), listProducts({ status: "approved" })]);
  const { brands, products } = applyFilter(brandsAll, productsAll, f);
  const scope = [
    f.brand ? brands[0]?.name_ko ?? "브랜드" : f.category ? CATEGORY_LABEL[f.category] : "전체",
    f.avail === "sponsor" ? "협찬 가능" : f.avail === "rental" ? "대여 가능" : "",
    f.q ? `'${f.q}' 검색` : "",
  ].filter(Boolean).join(" · ");
  return (
    <main className="a-wrap cat-wrap cat-print">
      <PrintBar backHref={`/to/catalog${filterQuery(f)}`} count={{ brands: brands.length, products: products.length }} scope={scope} />
      <CatalogDoc brands={brands} products={products} />
    </main>
  );
}
