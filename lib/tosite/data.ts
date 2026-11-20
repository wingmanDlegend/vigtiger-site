import "server-only";
import { cfg } from "@/lib/admin/db";
import { BRAND_CATEGORIES } from "@/lib/brands";
import { CATEGORIES, type CategoryKey, type Highlight } from "@/lib/partners/model";

// to.vigtiger.com — 크리에이터에게 보여 줄 공개 데이터
// 게시 중(승인) 제품 + 사용 중인 브랜드만, 공개해도 되는 칸만 골라 읽습니다.
// 결과는 5분 동안 캐시하고, 관리자 화면에서 제품·추천·핫딜을 바꾸면 TO_SITE_TAG 로 바로 비웁니다.
export const TO_SITE_TAG = "to-site";

export type PubBrand = {
  id: string;
  name_ko: string;
  name_en: string | null;
  category: CategoryKey;
  highlights: Highlight[];
  description: string | null;
  notice: string | null;
  sort: number;
};

export type PubProduct = {
  id: string;
  brand_id: string;
  serial: string | null;
  name: string;
  feature: string | null;
  section: string | null;
  sponsor: boolean;
  rental: boolean;
  product_url: string | null;
  image_url: string | null;
  note: string | null;
  sort: number;
  pick_week: boolean;
  pick_sort: number;
  hot_deal: boolean;
  hot_sort: number;
  hot_note: string | null;
  hot_until: string | null;
};

const BRAND_COLS = "id,name_ko,name_en,category,highlights,description,notice,sort";
const PRODUCT_COLS =
  "id,brand_id,serial,name,feature,section,sponsor,rental,product_url,image_url,note,sort,pick_week,pick_sort,hot_deal,hot_sort,hot_note,hot_until";

async function get<T>(path: string): Promise<T> {
  const { url, headers } = cfg();
  const res = await fetch(`${url}/rest/v1/${path}`, { headers, next: { revalidate: 300, tags: [TO_SITE_TAG] } });
  if (!res.ok) throw new Error(`TO 데이터 조회 실패 (${res.status})`);
  return res.json() as Promise<T>;
}

/** 한국 시간 오늘 (YYYY-MM-DD) */
export function todayKst() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export async function getToCatalog() {
  const [brandsRaw, productsRaw] = await Promise.all([
    get<PubBrand[]>(`partner_brands?select=${BRAND_COLS}&active=is.true&order=sort.asc,name_ko.asc&limit=1000`),
    get<PubProduct[]>(`to_products?select=${PRODUCT_COLS}&status=eq.approved&to_visible=is.true&order=sort.asc,created_at.asc&limit=5000`),
  ]);
  const catOrder = new Map(CATEGORIES.map((c, i) => [c.key, i]));
  const brands = brandsRaw
    .filter((b) => catOrder.has(b.category))
    .sort((a, b) => catOrder.get(a.category)! - catOrder.get(b.category)! || a.sort - b.sort);
  const bIndex = new Map(brands.map((b, i) => [b.id, i]));
  const products = productsRaw
    .filter((p) => bIndex.has(p.brand_id))
    .sort((a, b) => bIndex.get(a.brand_id)! - bIndex.get(b.brand_id)! || a.sort - b.sort);
  const brandById = new Map(brands.map((b) => [b.id, b]));

  const today = todayKst();
  const picks = products.filter((p) => p.pick_week).sort((a, b) => a.pick_sort - b.pick_sort);
  // 핫딜은 마지막 날(hot_until)이 지나면 저절로 내려갑니다.
  const hots = products
    .filter((p) => p.hot_deal && (!p.hot_until || p.hot_until >= today))
    .sort((a, b) => a.hot_sort - b.hot_sort);

  return { brands, products, brandById, picks, hots };
}

export type ToCounts = {
  /** 지금 to.vigtiger.com 에 보이는 브랜드 수 (노출 중 + 보이는 제품이 1개 이상) */
  brands: number;
  /** 지금 보이는 제품 수 (게시 중 + 제품 TO 노출 + 브랜드 노출) */
  products: number;
  /** 분류별 노출 브랜드 이름 (홈페이지 브랜드 목록용) */
  groups: { key: CategoryKey; ko: string; en: string; brands: string[] }[];
};

/** 홈페이지·티오 사이트 곳곳의 브랜드·제품 숫자 — 실제 노출 기준. 못 읽으면 null */
export async function getToCounts(): Promise<ToCounts | null> {
  try {
    const { brands, products } = await getToCatalog();
    // 노출 제품이 하나도 없으면(일시적인 문제일 수 있음) '0'을 보여 주지 않고 기본값으로
    if (products.length === 0) return null;
    const live = new Set(products.map((p) => p.brand_id));
    const shown = brands.filter((b) => live.has(b.id));
    const groups = CATEGORIES.map((c) => ({
      key: c.key,
      ko: c.label,
      en: BRAND_CATEGORIES.find((x) => x.key === c.key)?.en ?? c.label,
      brands: shown.filter((b) => b.category === c.key).map((b) => b.name_ko),
    })).filter((g) => g.brands.length > 0);
    return { brands: shown.length, products: products.length, groups };
  } catch {
    return null;
  }
}
