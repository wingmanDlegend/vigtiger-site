// 제품 리스트(게시물 보기)와 인쇄/PDF 보기가 같은 조건으로 고르도록 하는 공용 필터
import { CATEGORIES, type CategoryKey, type PartnerBrand, type ToProduct } from "./model";

export type CatalogFilter = { category?: CategoryKey; brand?: string; avail?: "sponsor" | "rental"; q?: string };

export function readFilter(sp: Record<string, string | undefined>): CatalogFilter {
  return {
    category: CATEGORIES.find((c) => c.key === sp.category)?.key,
    brand: sp.brand && /^[0-9a-f-]{36}$/i.test(sp.brand) ? sp.brand : undefined,
    avail: sp.avail === "sponsor" || sp.avail === "rental" ? sp.avail : undefined,
    q: (sp.q ?? "").trim().slice(0, 60) || undefined,
  };
}

export function filterQuery(f: CatalogFilter, patch: Partial<Record<keyof CatalogFilter, string | undefined>> = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...patch })) if (v) p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** 게시 중(승인) 제품만, 사용 중인 브랜드만. 분류 → 브랜드 순서 → 제품 순서로 정렬 */
export function applyFilter(brandsAll: PartnerBrand[], productsAll: ToProduct[], f: CatalogFilter) {
  const order = new Map(CATEGORIES.map((c, i) => [c.key, i]));
  let brands = brandsAll
    .filter((b) => b.active)
    .filter((b) => (!f.category || b.category === f.category) && (!f.brand || b.id === f.brand))
    .sort((a, b) => (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0) || a.sort - b.sort);
  const bset = new Map(brands.map((b, i) => [b.id, { b, i }]));
  const q = f.q?.toLowerCase();
  const products = productsAll
    .filter((p) => p.status === "approved" && p.to_visible !== false && bset.has(p.brand_id))
    .filter((p) => !f.avail || p[f.avail])
    .filter((p) => !q || [p.name, p.serial ?? "", p.feature ?? "", p.section ?? "", bset.get(p.brand_id)!.b.name_ko].some((x) => x.toLowerCase().includes(q)))
    .sort((a, b) => bset.get(a.brand_id)!.i - bset.get(b.brand_id)!.i || a.sort - b.sort);
  // 검색·협찬/대여 조건이 있으면 해당 제품이 있는 브랜드만
  if (f.q || f.avail) {
    const has = new Set(products.map((p) => p.brand_id));
    brands = brands.filter((b) => has.has(b.id));
  }
  return { brands, products };
}
