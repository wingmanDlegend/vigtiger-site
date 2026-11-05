// 협업 브랜드 (티오 대여 제품 리스트 기준, 2026년 11월)
// 로고는 브랜드별 사용 동의를 받은 뒤 추가합니다. 지금은 이름만 표시합니다.
import type { Lang } from "@/lib/forms";

export type BrandCategory = { key: string; ko: string; en: string; brands: string[] };

export const BRAND_CATEGORIES: BrandCategory[] = [
  {
    key: "appliance",
    ko: "생활가전",
    en: "Home appliances",
    brands: ["티나인", "소싱", "이오시카", "도깨비방망이", "스미스앤스미시", "오아", "보아르", "루메나", "풀무원건강생활", "제니퍼룸", "플랜잇", "스퀘어가든", "클렌하임", "올리", "클래파", "롯데알미늄", "트리아이", "아이리", "위도우", "데코아르", "바흐젠", "시티파이", "원에이커", "제스파", "안방그릴", "이지씰프로", "드리미", "한일", "솔러스에어"],
  },
  {
    key: "kitchen",
    ko: "생활/주방용품",
    en: "Living & kitchen",
    brands: ["코드리빙", "씨밀렉스", "에이트룸", "모에모에 라벨지", "플러퓨스 양모볼", "크로반 우산", "락앤락", "VBC 까사", "장듀보", "CLA Korea", "핑크스터프", "스텐팩토리", "하울스홈", "프라피아", "버그엑스", "스토조", "아토르"],
  },
  {
    key: "lifestyle",
    ko: "라이프스타일/취미",
    en: "Lifestyle & hobby",
    brands: ["데구르르", "플레이모빌", "오프온", "스트라이다 자전거", "도그독카트", "아우틴", "오션리치", "브뤼스타", "팩세이프", "미토도", "닥터클레오", "썬포토", "베르만 캐리어", "콜린스", "온다숲", "212 캔들"],
  },
  {
    key: "food",
    ko: "식품/음료",
    en: "Food & beverage",
    brands: ["루딜", "탄산오름", "쌍화명차", "널담", "다물꼬치", "오근내 닭갈비", "대관령푸드랩", "초정", "동아오츠카", "고기좀아는언니"],
  },
  {
    key: "diet",
    ko: "다이어트/건기식",
    en: "Diet & health food",
    brands: ["농협홍삼 한삼인", "로엘", "단백하루", "쉐이크베이비", "온누리 스토어", "루트인"],
  },
  {
    key: "digital",
    ko: "디지털/게이밍/음향기기",
    en: "Digital, gaming & audio",
    brands: ["키붐", "보바", "미디플러스", "로데", "크리에이티브", "글로리어스"],
  },
  {
    key: "health",
    ko: "헬스케어/홈트",
    en: "Healthcare & home fitness",
    brands: ["바디프랜드 미니", "타이탄핏", "루크아이", "와이온", "데이비트", "아이오랩", "멜킨스포츠", "유스마일"],
  },
];

export const BRAND_TOTAL = BRAND_CATEGORIES.reduce((n, c) => n + c.brands.length, 0);

/** 홈 화면에 보여 줄 주요 브랜드 */
export const FEATURED_BRANDS = [
  "락앤락",
  "바디프랜드 미니",
  "풀무원건강생활",
  "롯데알미늄",
  "동아오츠카",
  "한일",
  "드리미",
  "오아",
  "플레이모빌",
  "스트라이다 자전거",
  "농협홍삼 한삼인",
  "로데",
  "크리에이티브",
  "루메나",
  "핑크스터프",
  "미디플러스",
];

export const categoryOf = (brand: string) => BRAND_CATEGORIES.find((c) => c.brands.includes(brand));

export const BRAND_TEXT = {
  ko: {
    eyebrow: "PARTNER BRANDS",
    homeTitle: (n: number) => [`${n}개 브랜드가`, "대범한사람들과 함께합니다"],
    homeLead: "생활가전부터 식품·헬스케어까지, 크리에이터가 직접 써 보고 소개할 수 있는 브랜드들이 티오(TO)에 참여하고 있어요.",
    seeAll: "전체 브랜드 보기",
    dirTitle: "티오 참여 브랜드",
    dirLead: (n: number) => `${n}개 브랜드의 제품을 무료로 대여해 콘텐츠를 만들고, 마음에 들면 공동구매로 이어 갈 수 있어요.`,
    all: "전체",
    count: (n: number) => `${n}개`,
    note: "2026년 11월 티오 대여 제품 리스트 기준 · 브랜드 사정에 따라 대여 가능 제품은 달라질 수 있어요.",
    productList: "대여 가능 제품 리스트 보기",
    apply: "티오 신청하기",
  },
  en: {
    eyebrow: "PARTNER BRANDS",
    homeTitle: (n: number) => [`${n} brands`, "work with VIGTIGER"],
    homeLead: "From home appliances to food and healthcare, brands join TO so creators can try their products and introduce them in their content.",
    seeAll: "See all brands",
    dirTitle: "Brands in TO",
    dirLead: (n: number) => `Borrow products from ${n} brands for free to make content, and turn the ones you love into group-buys.`,
    all: "All",
    count: (n: number) => `${n}`,
    note: "Based on the TO product list, November 2026. Available products may change.",
    productList: "See available products",
    apply: "Apply for TO",
  },
} satisfies Record<Lang, unknown>;
