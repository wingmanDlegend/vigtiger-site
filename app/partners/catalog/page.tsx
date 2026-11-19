import type { Metadata } from "next";
import { requireSession } from "@/lib/partners/auth";
import { ensureSeeded, getBrand, listBrands, listProducts } from "@/lib/partners/db";
import { CATEGORIES, type PartnerBrand, type ToProduct } from "@/lib/partners/model";
import PTop from "../PTop";
import { CatalogCell } from "../ui";
import PrintBar from "./PrintBar";
import "./catalog.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "티오 제품 리스트" };

type SP = Promise<{ brand?: string; category?: string }>;

function groupBySection(ps: ToProduct[]) {
  const out: { section: string | null; items: ToProduct[] }[] = [];
  for (const p of ps) {
    const last = out[out.length - 1];
    if (last && last.section === (p.section ?? null)) last.items.push(p);
    else out.push({ section: p.section ?? null, items: [p] });
  }
  return out;
}

function BrandBlock({ b, products }: { b: PartnerBrand; products: ToProduct[] }) {
  return (
    <section className="cat-brand" aria-label={b.name_ko}>
      <div className="cat-brand-head">
        <div className="cat-brand-left">
          <h2 className="cat-brand-name">
            {b.name_ko} {b.name_en && <small>{b.name_en}</small>}
          </h2>
          {b.highlights?.length > 0 && (
            <div className="cat-hl">
              {b.highlights.map((h, i) => (
                <div key={i} className="cat-hl-item">
                  <b>{h.title}</b>
                  {h.sub && <span>{h.sub}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="cat-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {b.hero_url ? <img src={b.hero_url} alt="" /> : null}
        </div>
      </div>
      {b.description && <p className="cat-desc">{b.description}</p>}
      {b.notice && (
        <div className="cat-notice">
          <span className="cat-notice-label">꼭 알아두세요!</span>
          <div>
            {b.notice.split("\n").map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
        </div>
      )}
      {groupBySection(products).map((g, i) => (
        <div key={i} className="cat-group">
          {g.section && <h3 className="cat-section">{g.section}</h3>}
          <div className="cat-grid">
            {g.items.map((p) => (
              <CatalogCell key={p.id} p={{ ...p, feature: p.feature ?? "", product_url: p.product_url ?? "", image_url: p.image_url ?? "", note: p.note ?? "" }} serial={p.serial} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default async function Catalog({ searchParams }: { searchParams: SP }) {
  const s = await requireSession();
  const sp = await searchParams;
  if (s.role === "admin") await ensureSeeded().catch(() => false);
  let brands: PartnerBrand[];
  if (s.role === "brand") {
    const b = await getBrand(s.brandId!);
    brands = b ? [b] : [];
  } else {
    brands = (await listBrands()).filter((b) => b.active);
    if (sp.brand) brands = brands.filter((b) => b.id === sp.brand);
    else if (sp.category) brands = brands.filter((b) => b.category === sp.category);
  }
  const products = (await listProducts({ status: "approved", ...(brands.length === 1 ? { brandId: brands[0].id } : {}) })).filter((p) =>
    brands.some((b) => b.id === p.brand_id),
  );
  const byBrand = new Map<string, ToProduct[]>();
  for (const p of products) byBrand.set(p.brand_id, [...(byBrand.get(p.brand_id) ?? []), p]);
  const cats = CATEGORIES.map((c) => ({ ...c, brands: brands.filter((b) => b.category === c.key) })).filter((c) => c.brands.length);
  const single = brands.length === 1;
  const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" });
  const ownBrand = s.role === "brand" ? brands[0] : undefined;

  return (
    <>
      <PTop s={s} current="catalog" brandName={ownBrand?.name_ko} />
      <main className="a-wrap cat-wrap">
        <PrintBar
          admin={s.role === "admin"}
          brands={s.role === "admin" ? (await listBrands()).filter((b) => b.active).map((b) => ({ id: b.id, name: b.name_ko })) : []}
          current={{ brand: sp.brand ?? "", category: sp.category ?? "" }}
          count={{ brands: brands.length, products: products.length }}
        />
        <div className="cat-doc">
          {!single && (
            <>
              <section className="cat-page cat-cover">
                <p className="cat-cover-eyebrow">TO · 티오</p>
                <h1>대여·협찬 제품 리스트</h1>
                <p className="cat-cover-meta">
                  브랜드 {brands.length}곳 · 제품 {products.length}개<br />
                  {today} 기준
                </p>
                <p className="cat-cover-foot">(주)대범한사람들 · vigtiger.com</p>
              </section>
              <section className="cat-page cat-index">
                <h2>브랜드 목록</h2>
                <div className="cat-index-grid">
                  {cats.map((c) => (
                    <div key={c.key} className="cat-index-cat">
                      <h3><span>{c.no}.</span> {c.label}</h3>
                      <ul>
                        {c.brands.map((b) => (
                          <li key={b.id}>
                            {b.name_ko} <small>{(byBrand.get(b.id) ?? []).length}</small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          {cats.map((c) => (
            <div key={c.key}>
              {!single && (
                <section className="cat-page cat-divider">
                  <h2><span>{c.no}.</span> {c.label}</h2>
                </section>
              )}
              {c.brands.map((b) => (
                <BrandBlock key={b.id} b={b} products={byBrand.get(b.id) ?? []} />
              ))}
            </div>
          ))}
          {brands.length === 0 && <p className="a-empty">출력할 브랜드가 없어요.</p>}
        </div>
      </main>
    </>
  );
}
