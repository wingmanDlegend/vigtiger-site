import type { Metadata } from "next";
import { requireAdmin } from "@/lib/partners/auth";
import { ensureSeeded, listBrands, listProducts } from "@/lib/partners/db";
import { applyFilter, filterQuery, readFilter } from "@/lib/partners/catalog";
import { CATEGORIES } from "@/lib/partners/model";
import ProductBoard from "@/components/partners/ProductBoard";
import AdminTop from "@/app/admin/AdminTop";
import { PageHead } from "@/app/admin/SubNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "제품 리스트" };

type SP = Promise<Record<string, string | undefined>>;

export default async function AdminCatalog({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const f = readFilter(await searchParams);
  await ensureSeeded().catch(() => false);
  const [brandsAll, productsAll] = await Promise.all([listBrands(), listProducts({ status: "approved" })]);
  const { brands, products } = applyFilter(brandsAll, productsAll, f);
  const activeBrands = brandsAll.filter((b) => b.active && (!f.category || b.category === f.category));
  const catCount = (key?: string) => applyFilter(brandsAll, productsAll, { ...f, category: key as typeof f.category, brand: undefined }).products.length;
  const filtered = Boolean(f.category || f.brand || f.avail || f.q);

  return (
    <>
      <AdminTop current="to-catalog" />
      <main className="a-wrap">
        <PageHead
          crumb="티오 파트너스"
          title="제품 리스트"
          desc="지금 게시 중인 티오 대여·협찬 제품이에요. 크리에이터에게 보낼 리스트는 '인쇄/PDF로 보기'에서 만들어요."
          actions={<a className="a-btn" href={`/to/catalog/print${filterQuery(f)}`}>인쇄/PDF로 보기</a>}
        />
        <nav className="a-tabs" aria-label="분류">
          <a className="a-tab" href={`/to/catalog${filterQuery(f, { category: undefined, brand: undefined })}`} aria-current={!f.category ? "page" : undefined}>
            전체 <b>{catCount(undefined)}</b>
          </a>
          {CATEGORIES.map((c) => (
            <a key={c.key} className="a-tab" href={`/to/catalog${filterQuery(f, { category: c.key, brand: undefined })}`} aria-current={f.category === c.key ? "page" : undefined}>
              {c.label} <b>{catCount(c.key)}</b>
            </a>
          ))}
        </nav>
        <form className="a-filter" method="get" action="/to/catalog">
          {f.category && <input type="hidden" name="category" value={f.category} />}
          <select className="a-select" name="brand" defaultValue={f.brand ?? ""} aria-label="브랜드">
            <option value="">{f.category ? "이 분류 전체 브랜드" : "전체 브랜드"}</option>
            {activeBrands.map((b) => (
              <option key={b.id} value={b.id}>{b.name_ko}</option>
            ))}
          </select>
          <select className="a-select" name="avail" defaultValue={f.avail ?? ""} aria-label="협찬·대여">
            <option value="">협찬·대여 전체</option>
            <option value="sponsor">협찬 가능만</option>
            <option value="rental">대여 가능만</option>
          </select>
          <input className="a-input" type="search" name="q" defaultValue={f.q ?? ""} placeholder="제품명·브랜드·일련번호·특징" aria-label="검색" />
          <button className="a-btn is-ghost" type="submit">적용</button>
          {filtered && <a className="a-sub" href="/to/catalog">조건 지우기</a>}
        </form>
        <p className="a-sub">브랜드 {brands.filter((b) => products.some((p) => p.brand_id === b.id)).length}곳 · 제품 {products.length}개</p>
        <ProductBoard brands={brands} products={products} productHref={(p) => `/to/products/${p.id}`} />
      </main>
    </>
  );
}
