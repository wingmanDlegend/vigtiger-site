import type { Metadata } from "next";
import { requireAdmin } from "@/lib/partners/auth";
import { ensureSeeded, listBrands, listProducts } from "@/lib/partners/db";
import { CatalogDoc } from "@/components/partners/Catalog";
import PrintBar from "@/components/partners/PrintBar";
import AdminTop from "@/app/admin/AdminTop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "제품 리스트 출력" };

export default async function AdminCatalog({ searchParams }: { searchParams: Promise<{ brand?: string; category?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  await ensureSeeded().catch(() => false);
  const all = (await listBrands()).filter((b) => b.active);
  let brands = all;
  if (sp.brand) brands = all.filter((b) => b.id === sp.brand);
  else if (sp.category) brands = all.filter((b) => b.category === sp.category);
  const ids = new Set(brands.map((b) => b.id));
  const products = (await listProducts({ status: "approved", ...(brands.length === 1 ? { brandId: brands[0].id } : {}) })).filter((p) => ids.has(p.brand_id));
  return (
    <>
      <AdminTop current="to-catalog" />
      <main className="a-wrap cat-wrap">
        <PrintBar
          admin
          brands={all.map((b) => ({ id: b.id, name: b.name_ko }))}
          current={{ brand: sp.brand ?? "", category: sp.category ?? "" }}
          count={{ brands: brands.length, products: products.length }}
        />
        <CatalogDoc brands={brands} products={products} />
      </main>
    </>
  );
}
