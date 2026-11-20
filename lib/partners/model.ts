// partners.vigtiger.com — 티오(TO) 제품 관리: 화면·서버 공용 타입과 입력 검사
import { BRAND_CATEGORIES } from "@/lib/brands";

export type CategoryKey = "appliance" | "kitchen" | "lifestyle" | "food" | "diet" | "digital" | "health";
export const CATEGORIES = BRAND_CATEGORIES.map((c, i) => ({ key: c.key as CategoryKey, label: c.ko, no: String(i + 1).padStart(2, "0") }));
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label])) as Record<CategoryKey, string>;

export type Highlight = { title: string; sub: string };

export type PartnerBrand = {
  id: string;
  code: string;
  name_ko: string;
  name_en: string | null;
  category: CategoryKey;
  highlights: Highlight[];
  description: string | null;
  notice: string | null;
  hero_url: string | null;
  sort: number;
  active: boolean;
  pending_changes: Partial<BrandProfile> | null;
  change_requested_at: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductStatus = "pending" | "approved" | "rejected" | "hidden";
export const STATUS_LABEL: Record<ProductStatus, string> = {
  pending: "승인 대기",
  approved: "게시 중",
  rejected: "반려",
  hidden: "숨김",
};

export type ToProduct = {
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
  status: ProductStatus;
  pending_changes: Partial<ProductDraft> | null;
  change_requested_at: string | null;
  delete_requested: boolean;
  reject_reason: string | null;
  sort: number;
  /** to.vigtiger.com 노출 — 이번 주 추천 / 핫딜 (admin에서 관리) */
  pick_week: boolean;
  pick_sort: number;
  hot_deal: boolean;
  hot_sort: number;
  hot_note: string | null;
  /** 핫딜 노출 마지막 날 (이 날까지 보이고 다음 날부터 자동으로 숨김) */
  hot_until: string | null;
  created_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PartnerUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "admin" | "brand";
  brand_id: string | null;
  must_change_password: boolean;
  failed_attempts: number;
  locked_until: string | null;
  active: boolean;
  token_version: number;
  last_login_at: string | null;
  created_at: string;
};

/** 브랜드가 고칠 수 있는 제품 항목 */
export type ProductDraft = {
  name: string;
  feature: string;
  section: string;
  sponsor: boolean;
  rental: boolean;
  product_url: string;
  image_url: string;
  note: string;
};
export const PRODUCT_FIELDS: { key: keyof ProductDraft; label: string }[] = [
  { key: "name", label: "제품명" },
  { key: "feature", label: "특징" },
  { key: "section", label: "분류" },
  { key: "sponsor", label: "협찬" },
  { key: "rental", label: "대여" },
  { key: "product_url", label: "상품 링크" },
  { key: "image_url", label: "제품 이미지" },
  { key: "note", label: "비고" },
];

/** 브랜드가 고칠 수 있는 브랜드 소개 항목 */
export type BrandProfile = {
  name_en: string;
  highlights: Highlight[];
  description: string;
  notice: string;
  hero_url: string;
};
export const BRAND_FIELDS: { key: keyof BrandProfile; label: string }[] = [
  { key: "name_en", label: "영문 이름" },
  { key: "highlights", label: "강점" },
  { key: "description", label: "브랜드 소개" },
  { key: "notice", label: "꼭 알아두세요" },
  { key: "hero_url", label: "대표 이미지" },
];

const str = (v: unknown) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : "");
const oneLine = (v: unknown) => str(v).replace(/\s+/g, " ");

export function safeHttpUrl(v: string) {
  if (!v) return "";
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** 이미지 주소: 우리 저장소(Supabase)나 초기 데이터 경로만 허용 */
export function safeImageUrl(v: string) {
  if (!v) return "";
  if (/^\/partners-seed\/[a-z0-9-]+\.(webp|jpg|png)$/.test(v)) return v;
  const base = process.env.SUPABASE_URL
    ? `${process.env.SUPABASE_URL}/storage/v1/object/public/partners/`
    : "https://owaqmihlyoviompuplmi.supabase.co/storage/v1/object/public/partners/";
  return v.startsWith(base) && !v.includes("..") ? v : null;
}

export function cleanProduct(raw: Record<string, unknown>): { value: ProductDraft; errors: string[] } {
  const errors: string[] = [];
  const value: ProductDraft = {
    name: oneLine(raw.name).slice(0, 200),
    feature: str(raw.feature).slice(0, 1000),
    section: oneLine(raw.section).slice(0, 80),
    sponsor: raw.sponsor === true || raw.sponsor === "true" || raw.sponsor === "on",
    rental: raw.rental === true || raw.rental === "true" || raw.rental === "on",
    product_url: oneLine(raw.product_url),
    image_url: oneLine(raw.image_url),
    note: oneLine(raw.note).slice(0, 100),
  };
  if (!value.name) errors.push("제품명을 입력해 주세요.");
  if (value.name.length > 120) errors.push("제품명은 120자까지 쓸 수 있어요.");
  if (value.feature.length > 500) errors.push("특징은 500자까지 쓸 수 있어요.");
  if (value.section.length > 40) errors.push("분류는 40자까지 쓸 수 있어요.");
  if (value.note.length > 60) errors.push("비고는 60자까지 쓸 수 있어요.");
  const url = safeHttpUrl(value.product_url);
  if (url === null) errors.push("상품 링크는 https:// 로 시작하는 주소여야 해요.");
  else value.product_url = url;
  const img = safeImageUrl(value.image_url);
  if (img === null) errors.push("제품 이미지는 이 사이트에서 올린 파일만 쓸 수 있어요.");
  return { value, errors };
}

export function cleanBrandProfile(raw: Record<string, unknown>): { value: BrandProfile; errors: string[] } {
  const errors: string[] = [];
  const hl = Array.isArray(raw.highlights) ? raw.highlights : [];
  const value: BrandProfile = {
    name_en: oneLine(raw.name_en).slice(0, 120),
    highlights: hl
      .slice(0, 2)
      .map((h) => ({ title: oneLine((h as Highlight)?.title).slice(0, 80), sub: oneLine((h as Highlight)?.sub).slice(0, 120) }))
      .filter((h) => h.title || h.sub),
    description: str(raw.description).slice(0, 3000),
    notice: str(raw.notice).slice(0, 1500),
    hero_url: oneLine(raw.hero_url),
  };
  if (value.name_en.length > 80) errors.push("영문 이름은 80자까지 쓸 수 있어요.");
  if (value.description.length > 2000) errors.push("브랜드 소개는 2,000자까지 쓸 수 있어요.");
  if (value.notice.length > 1000) errors.push("'꼭 알아두세요'는 1,000자까지 쓸 수 있어요.");
  const img = safeImageUrl(value.hero_url);
  if (img === null) errors.push("대표 이미지는 이 사이트에서 올린 파일만 쓸 수 있어요.");
  return { value, errors };
}

/** DB 값(null 포함)을 입력 초안 형태로 */
export function productToDraft(p: ToProduct): ProductDraft {
  return {
    name: p.name,
    feature: p.feature ?? "",
    section: p.section ?? "",
    sponsor: p.sponsor,
    rental: p.rental,
    product_url: p.product_url ?? "",
    image_url: p.image_url ?? "",
    note: p.note ?? "",
  };
}
export function brandToProfile(b: PartnerBrand): BrandProfile {
  return {
    name_en: b.name_en ?? "",
    highlights: b.highlights ?? [],
    description: b.description ?? "",
    notice: b.notice ?? "",
    hero_url: b.hero_url ?? "",
  };
}

/** 바뀐 항목만 */
export function diffKeys<T extends object>(before: T, after: Partial<T>) {
  return (Object.keys(after) as (keyof T)[]).filter((k) => JSON.stringify(before[k] ?? "") !== JSON.stringify(after[k] ?? ""));
}

/** 초안 → DB 열 (빈 문자열은 null) */
export function draftToRow(d: Partial<ProductDraft>) {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) row[k] = typeof v === "string" ? v || null : v;
  if ("name" in row && !row.name) delete row.name;
  return row;
}
export function profileToRow(d: Partial<BrandProfile>) {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) row[k] = typeof v === "string" ? v || null : v;
  return row;
}

export const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "–";

export const fmtDay = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }) : "–";
