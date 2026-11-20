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
  /** 브랜드가 신청한 TO 서비스 노출 변경 (show 노출 신청 / hide 노출 중지 신청) — 관리자 확인 대기 */
  visibility_request: "show" | "hide" | null;
  visibility_requested_at: string | null;
  visibility_reject_reason: string | null;
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
  /** 브랜드가 정하는 TO 서비스 노출 (끄면 to.vigtiger.com·제품 리스트·인쇄에서 빠짐, 승인 없이 바로 반영) */
  to_visible: boolean;
  list_price: number | null;
  online_price: number | null;
  groupbuy_price: number | null;
  commission_rate: number | null;
  own_mall_groupbuy: OwnMall | null;
  gift: string | null;
  extra_note: string | null;
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

/** 브랜드가 신청하는 이번 주 추천 · 핫딜 */
export type PromoKind = "pick" | "hot";
export const PROMO_KIND_LABEL: Record<PromoKind, string> = { pick: "이번 주 추천", hot: "핫딜" };
export type PromoRequestStatus = "pending" | "approved" | "rejected" | "canceled";
export const PROMO_STATUS_LABEL: Record<PromoRequestStatus, string> = { pending: "확인 중", approved: "진행", rejected: "반려", canceled: "취소" };
export type PromoRequest = {
  id: string;
  brand_id: string;
  product_id: string;
  kind: PromoKind;
  hot_note: string | null;
  start_date: string | null;
  end_date: string | null;
  message: string | null;
  status: PromoRequestStatus;
  reject_reason: string | null;
  created_by: string | null;
  created_at: string;
  decided_at: string | null;
};

export type OwnMall = "yes" | "no" | "discuss";
export const OWN_MALL_LABEL: Record<OwnMall, string> = { yes: "진행해요", no: "진행 안 해요", discuss: "협의 가능" };

/** 브랜드가 고칠 수 있는 제품 항목 (가격·판매 조건 포함 — 승인 후 반영) */
export type ProductDraft = {
  name: string;
  feature: string;
  section: string;
  sponsor: boolean;
  rental: boolean;
  product_url: string;
  image_url: string;
  note: string;
  list_price: number | null;
  online_price: number | null;
  groupbuy_price: number | null;
  commission_rate: number | null;
  own_mall_groupbuy: OwnMall | "";
  gift: string;
  extra_note: string;
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
  { key: "list_price", label: "정가" },
  { key: "online_price", label: "온라인 판매가" },
  { key: "groupbuy_price", label: "공구가" },
  { key: "commission_rate", label: "판매 수수료" },
  { key: "own_mall_groupbuy", label: "자사몰 공구 진행" },
  { key: "gift", label: "사은품" },
  { key: "extra_note", label: "기타 사항" },
];

export const PRICE_KEYS: string[] = ["list_price", "online_price", "groupbuy_price", "commission_rate", "own_mall_groupbuy", "gift", "extra_note"];
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
/** 승인 화면·목록에서 값 보여 주기 */
export function fieldText(k: keyof ProductDraft | string, v: unknown): string {
  if (v === null || v === undefined || v === "") return "–";
  if (k === "list_price" || k === "online_price" || k === "groupbuy_price") return typeof v === "number" ? won(v) : String(v);
  if (k === "commission_rate") return `${v}%`;
  if (k === "own_mall_groupbuy") return OWN_MALL_LABEL[v as OwnMall] ?? String(v);
  if (typeof v === "boolean") return v ? "가능" : "불가";
  return String(v);
}
/** 정가 대비 할인율 (공구가·판매가) */
export function discountPct(base: number | null, price: number | null) {
  if (!base || price === null || price === undefined || price > base) return null;
  return Math.round(((base - price) / base) * 100);
}

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

/** "12,000원" → 12000, 빈칸 → null, 이상한 값 → NaN */
function money(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? Math.round(v) : NaN;
  const s = String(v).replace(/[,\s원]/g, "");
  if (!s) return null;
  return /^\d{1,10}$/.test(s) ? Number(s) : NaN;
}
function percent(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[\s%]/g, "");
  if (!s) return null;
  return /^\d{1,3}(\.\d{1,2})?$/.test(s) ? Number(s) : NaN;
}

/** 브랜드 이름 비교용: 대소문자·띄어쓰기·기호 무시 */
export const brandKey = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/[\s·.\-_()（）]/g, "");

/** 다른 브랜드와 이름·코드가 겹치는지 — 겹치면 안내 문구 목록 */
export function brandDuplicates(
  others: Pick<PartnerBrand, "id" | "name_ko" | "name_en" | "code">[],
  v: { id?: string | null; name_ko?: string; name_en?: string; code?: string },
) {
  const out: string[] = [];
  const rest = others.filter((b) => b.id !== v.id);
  if (v.name_ko) {
    const hit = rest.find((b) => brandKey(b.name_ko) === brandKey(v.name_ko) || (b.name_en && brandKey(b.name_en) === brandKey(v.name_ko)));
    if (hit) out.push(`브랜드 이름 '${v.name_ko}'이(가) 이미 등록된 브랜드 '${hit.name_ko}'(코드 ${hit.code})와(과) 겹쳐요. 확인 후 다시 입력해 주세요.`);
  }
  if (v.name_en) {
    const hit = rest.find((b) => (b.name_en && brandKey(b.name_en) === brandKey(v.name_en)) || brandKey(b.name_ko) === brandKey(v.name_en));
    if (hit) out.push(`영문 이름 '${v.name_en}'이(가) 이미 등록된 브랜드 '${hit.name_ko}'(코드 ${hit.code})와(과) 겹쳐요. 확인 후 다시 입력해 주세요.`);
  }
  if (v.code) {
    const hit = rest.find((b) => b.code.toUpperCase() === v.code!.toUpperCase());
    if (hit) out.push(`브랜드 코드 '${v.code}'은(는) 이미 '${hit.name_ko}' 브랜드가 쓰고 있어요. 다른 코드로 다시 입력해 주세요.`);
  }
  return out;
}

export function cleanProduct(raw: Record<string, unknown>): { value: ProductDraft; errors: string[] } {
  const errors: string[] = [];
  const om = String(raw.own_mall_groupbuy ?? "");
  const value: ProductDraft = {
    name: oneLine(raw.name).slice(0, 200),
    feature: str(raw.feature).slice(0, 1000),
    section: oneLine(raw.section).slice(0, 80),
    sponsor: raw.sponsor === true || raw.sponsor === "true" || raw.sponsor === "on",
    rental: raw.rental === true || raw.rental === "true" || raw.rental === "on",
    product_url: oneLine(raw.product_url),
    image_url: oneLine(raw.image_url),
    note: oneLine(raw.note).slice(0, 100),
    list_price: money(raw.list_price),
    online_price: money(raw.online_price),
    groupbuy_price: money(raw.groupbuy_price),
    commission_rate: percent(raw.commission_rate),
    own_mall_groupbuy: om === "yes" || om === "no" || om === "discuss" ? om : "",
    gift: oneLine(raw.gift).slice(0, 300),
    extra_note: str(raw.extra_note).slice(0, 1500),
  };
  for (const [k, label] of [["list_price", "정가"], ["online_price", "온라인 판매가"], ["groupbuy_price", "공구가"]] as const) {
    const n = value[k];
    if (n !== null && (Number.isNaN(n) || n > 1000000000)) errors.push(`${label}는 숫자(원)로 적어 주세요.`);
  }
  if (value.commission_rate !== null && (Number.isNaN(value.commission_rate) || value.commission_rate > 100)) errors.push("판매 수수료는 0~100 사이 숫자(%)로 적어 주세요.");
  if (value.gift.length > 200) errors.push("사은품은 200자까지 쓸 수 있어요.");
  if (value.extra_note.length > 1000) errors.push("기타 사항은 1,000자까지 쓸 수 있어요.");
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
    list_price: p.list_price ?? null,
    online_price: p.online_price ?? null,
    groupbuy_price: p.groupbuy_price ?? null,
    commission_rate: p.commission_rate === null || p.commission_rate === undefined ? null : Number(p.commission_rate),
    own_mall_groupbuy: p.own_mall_groupbuy ?? "",
    gift: p.gift ?? "",
    extra_note: p.extra_note ?? "",
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
