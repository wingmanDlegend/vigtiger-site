// 신청서 3종의 항목 정의 — 화면(폼)과 서버 검증(/api/apply)이 같은 정의를 씁니다.
// 항목을 추가·수정할 때는 이 파일만 고치면 됩니다.

export type Lang = "ko" | "en";
export type FormType = "creator" | "advertiser" | "partner";
export const FORM_TYPES: FormType[] = ["creator", "advertiser", "partner"];

type L = Record<Lang, string>;
export type Option = { value: string; label: L };
export type Field = {
  key: string;
  kind: "text" | "url" | "select" | "checkboxes" | "radio";
  label: L;
  required?: boolean;
  placeholder?: L;
  options?: Option[];
};

const productCategories: Option[] = [
  { value: "beauty", label: { ko: "뷰티·화장품", en: "Beauty & cosmetics" } },
  { value: "food", label: { ko: "식품·건강기능식품", en: "Food & supplements" } },
  { value: "fashion", label: { ko: "패션·잡화", en: "Fashion & accessories" } },
  { value: "living", label: { ko: "생활·리빙", en: "Home & living" } },
  { value: "kids", label: { ko: "유아·키즈", en: "Baby & kids" } },
  { value: "tech", label: { ko: "가전·IT", en: "Electronics & tech" } },
  { value: "other", label: { ko: "기타", en: "Other" } },
];

export const FORMS: Record<
  FormType,
  { nameLabel: L; fields: Field[] }
> = {
  creator: {
    nameLabel: { ko: "이름(활동명)", en: "Name (or creator name)" },
    fields: [
      { key: "channelName", kind: "text", required: true, label: { ko: "채널명", en: "Channel name" } },
      {
        key: "channelUrl",
        kind: "url",
        required: true,
        label: { ko: "채널 URL", en: "Channel URL" },
        placeholder: { ko: "https://www.youtube.com/@", en: "https://www.youtube.com/@" },
      },
      {
        key: "subscribers",
        kind: "select",
        required: true,
        label: { ko: "구독자 수", en: "Subscribers" },
        options: [
          { value: "under10k", label: { ko: "1만 미만", en: "Under 10K" } },
          { value: "10k-100k", label: { ko: "1만~10만", en: "10K–100K" } },
          { value: "100k-500k", label: { ko: "10만~50만", en: "100K–500K" } },
          { value: "500k-1m", label: { ko: "50만~100만", en: "500K–1M" } },
          { value: "over1m", label: { ko: "100만 이상", en: "Over 1M" } },
        ],
      },
      {
        key: "category",
        kind: "select",
        required: true,
        label: { ko: "채널 카테고리", en: "Channel category" },
        options: [
          { value: "beauty", label: { ko: "뷰티·패션", en: "Beauty & fashion" } },
          { value: "food", label: { ko: "푸드·쿡방", en: "Food & cooking" } },
          { value: "health", label: { ko: "건강·운동", en: "Health & fitness" } },
          { value: "living", label: { ko: "리빙·육아", en: "Living & parenting" } },
          { value: "tech", label: { ko: "IT·테크", en: "Tech" } },
          { value: "travel", label: { ko: "여행·일상", en: "Travel & vlog" } },
          { value: "entertainment", label: { ko: "엔터·예능", en: "Entertainment" } },
          { value: "other", label: { ko: "기타", en: "Other" } },
        ],
      },
      {
        key: "interests",
        kind: "checkboxes",
        required: true,
        label: { ko: "관심 있는 서비스", en: "Services you're interested in" },
        options: [
          { value: "advirtual", label: { ko: "애드버추얼 (가상 PPL)", en: "Advirtual (virtual product placement)" } },
          { value: "shopping", label: { ko: "쇼핑올인원 (쇼핑몰 운영 대행)", en: "Shopping All-in-One (store operations)" } },
          { value: "to", label: { ko: "티오 (무료 제품 대여)", en: "TO (free product try-outs)" } },
          { value: "groupbuy", label: { ko: "공동구매 제안 받기", en: "Group-buy proposals" } },
        ],
      },
      {
        key: "commerceExp",
        kind: "radio",
        label: { ko: "커머스·공동구매 경험", en: "Commerce or group-buy experience" },
        options: [
          { value: "yes", label: { ko: "있음", en: "Yes" } },
          { value: "no", label: { ko: "없음", en: "Not yet" } },
        ],
      },
    ],
  },
  advertiser: {
    nameLabel: { ko: "담당자명", en: "Your name" },
    fields: [
      { key: "company", kind: "text", required: true, label: { ko: "회사·브랜드명", en: "Company or brand" } },
      { key: "productName", kind: "text", required: true, label: { ko: "홍보할 제품·서비스", en: "Product or service to promote" } },
      {
        key: "productUrl",
        kind: "url",
        label: { ko: "제품·브랜드 URL", en: "Product or brand URL" },
        placeholder: { ko: "https://", en: "https://" },
      },
      { key: "category", kind: "select", required: true, label: { ko: "제품 카테고리", en: "Product category" }, options: productCategories },
      {
        key: "interests",
        kind: "checkboxes",
        required: true,
        label: { ko: "관심 있는 상품", en: "What you're interested in" },
        options: [
          { value: "advirtual", label: { ko: "애드버추얼 (가상 PPL)", en: "Advirtual (virtual product placement)" } },
          { value: "groupbuy", label: { ko: "크리에이터 공동구매", en: "Creator group-buys" } },
          { value: "shopping", label: { ko: "유튜버 쇼핑몰 입점", en: "Listing in creator stores" } },
          { value: "consult", label: { ko: "상담 후 결정", en: "Not sure yet — let's talk" } },
        ],
      },
      {
        key: "budget",
        kind: "select",
        label: { ko: "예상 예산", en: "Estimated budget" },
        options: [
          { value: "under5m", label: { ko: "500만 원 미만", en: "Under ₩5M" } },
          { value: "5m-20m", label: { ko: "500만~2,000만 원", en: "₩5M–20M" } },
          { value: "20m-50m", label: { ko: "2,000만~5,000만 원", en: "₩20M–50M" } },
          { value: "over50m", label: { ko: "5,000만 원 이상", en: "Over ₩50M" } },
          { value: "undecided", label: { ko: "미정", en: "Undecided" } },
        ],
      },
      {
        key: "timing",
        kind: "select",
        label: { ko: "희망 집행 시기", en: "Preferred timing" },
        options: [
          { value: "asap", label: { ko: "가능한 빨리", en: "As soon as possible" } },
          { value: "1m", label: { ko: "1개월 이내", en: "Within a month" } },
          { value: "3m", label: { ko: "3개월 이내", en: "Within 3 months" } },
          { value: "undecided", label: { ko: "미정", en: "Undecided" } },
        ],
      },
    ],
  },
  partner: {
    nameLabel: { ko: "담당자명", en: "Your name" },
    fields: [
      { key: "company", kind: "text", required: true, label: { ko: "회사명", en: "Company" } },
      { key: "brand", kind: "text", required: true, label: { ko: "브랜드명", en: "Brand" } },
      {
        key: "storeUrl",
        kind: "url",
        label: { ko: "자사몰·스토어 URL", en: "Website or store URL" },
        placeholder: { ko: "https://", en: "https://" },
      },
      { key: "category", kind: "select", required: true, label: { ko: "제품 카테고리", en: "Product category" }, options: productCategories },
      { key: "mainProduct", kind: "text", required: true, label: { ko: "대표 상품", en: "Flagship product" } },
      {
        key: "channels",
        kind: "checkboxes",
        label: { ko: "현재 판매 채널", en: "Current sales channels" },
        options: [
          { value: "own", label: { ko: "자사몰", en: "Own online store" } },
          { value: "smartstore", label: { ko: "네이버 스마트스토어", en: "Naver Smart Store" } },
          { value: "coupang", label: { ko: "쿠팡", en: "Coupang" } },
          { value: "openmarket", label: { ko: "기타 오픈마켓", en: "Other marketplaces" } },
          { value: "offline", label: { ko: "오프라인", en: "Offline retail" } },
          { value: "none", label: { ko: "아직 없음", en: "None yet" } },
        ],
      },
      {
        key: "toJoin",
        kind: "radio",
        required: true,
        label: { ko: "티오(크리에이터 무료 대여) 참여 의향", en: "Join TO (free creator try-outs)?" },
        options: [
          { value: "yes", label: { ko: "참여하고 싶어요", en: "Yes, I'd like to" } },
          { value: "consult", label: { ko: "상담 후 결정", en: "Let's discuss first" } },
          { value: "no", label: { ko: "입점만 원해요", en: "Listing only" } },
        ],
      },
    ],
  },
};

export const LIMITS = { short: 200, message: 4000 };
