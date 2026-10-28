import type { FormType, Lang } from "./forms";

export const LANGS: Lang[] = ["ko", "en"];
export const isLang = (v: string): v is Lang => v === "ko" || v === "en";

// 한국어는 접두사 없이, 영어는 /en 아래로 링크합니다.
export const homePath = (lang: Lang) => (lang === "ko" ? "/" : "/en");
export const applyPath = (lang: Lang, type: FormType, interest?: string) =>
  (lang === "ko" ? `/apply/${type}` : `/en/apply/${type}`) + (interest ? `?interest=${interest}` : "");

export type PageSlug = "about" | "services/advirtual" | "services/shopping" | "services/to" | "privacy";
export const pagePath = (lang: Lang, slug: PageSlug) => (lang === "ko" ? `/${slug}` : `/en/${slug}`);

export const CONTACT = {
  kakao: "http://pf.kakao.com/_xlxnjrG/chat",
  email: "vigtiger@vigtiger.com",
  phone: "02-544-6290",
  phoneTel: "+8225446290",
  press: "https://n.news.naver.com/mnews/article/011/0004210768?sid=101",
  toProducts: "https://bit.ly/TO_product_list",
};

const ko = {
  meta: {
    title: "대범한사람들 — 크리에이터 커머스 파트너",
    description:
      "(주)대범한사람들은 유튜브 크리에이터와 브랜드의 광고, 커머스 운영, 제품 체험을 한 번에 연결하는 소셜 커머스 전문 기업입니다.",
  },
  nav: { about: "회사소개", services: "서비스", advirtual: "애드버추얼", shopping: "쇼핑올인원", to: "티오(TO)", team: "팀", contact: "협업 문의", cta: "상담 신청", switchTo: "ENG", menu: "주요 메뉴", footerMenu: "하단 메뉴", mobileMenu: "메뉴", privacy: "개인정보처리방침", more: "자세히 보기", home: "홈" },
  hero: {
    eyebrow: "소셜 커머스 전문 기업 · Since 2020",
    title: ["크리에이터의 영향력을,", "팔리는 비즈니스로."],
    body: "대범한사람들은 유튜브 크리에이터와 브랜드가 함께 성장하도록 광고, 커머스 운영, 제품 체험까지 한 번에 연결합니다.",
    primary: "크리에이터 상담 신청",
    secondary: "브랜드 광고·입점 문의",
    mock: {
      alt: "크리에이터 영상 위 지정 영역에 브랜드 광고 소재와 유튜브 쇼핑 버튼이 얹힌 예시 화면",
      video: "이미 업로드된 크리에이터 영상",
      adTag: "AD · 오버레이",
      adTitle: "브랜드 광고 소재",
      shopTitle: "제품 보기",
      shopSub: "유튜브 쇼핑",
      caption: "애드버추얼 — 이미 만든 영상의 사전 협의된 영역에 광고를 얹고, 같은 화면에서 유튜브 쇼핑으로 구매까지 연결합니다.",
    },
  },
  stats: {
    label: "주요 성과",
    items: [
      { value: "84", unit: "개", label: "비즈니스를 지원하는 유튜브 채널" },
      { value: "992", unit: "만", label: "협업 채널 누적 구독자" },
      { value: "80", unit: "+", label: "티오(TO) 참여 브랜드" },
      { value: "1", unit: "주", label: "애드버추얼 결정 후 집행까지" },
    ],
    note: "채널·구독자 수 2025년 기준, 티오 참여 브랜드 2025년 4월 기준",
  },
  about: {
    eyebrow: "WHO WE WORK WITH",
    title: ["크리에이터, 브랜드, 상품 파트너.", "세 주체가 함께 이기는 구조를 만듭니다."],
    body: "2020년 설립 이후, 소셜미디어 안에서 누구나 쉽게 커머스를 시작할 수 있도록 상품 공급사와 콘텐츠 크리에이터를 지원하고 있습니다.",
    cards: [
      {
        type: "creator" as FormType,
        tag: "크리에이터",
        title: ["영상은 만들던 대로.", "수익화는 저희가 운영합니다."],
        points: ["애드버추얼로 검수 부담 적은 PPL 수익", "쇼핑올인원으로 나만의 쇼핑몰 운영", "티오로 먼저 써보고 자신 있게 추천"],
        cta: "비즈니스 상담 신청",
      },
      {
        type: "advertiser" as FormType,
        tag: "광고주·브랜드",
        title: ["제작비 부담 없이 1주일 안에", "노출하고, 판매까지."],
        points: ["이미 반응이 검증된 콘텐츠에 광고 오버레이", "유튜브 쇼핑 연동으로 화면에서 바로 구매", "여러 채널 모집·공동구매 구성까지 동시 진행"],
        cta: "광고 신청",
      },
      {
        type: "partner" as FormType,
        tag: "상품 파트너",
        title: ["한 번의 입점으로", "여러 유튜버 쇼핑몰에."],
        points: ["다수 크리에이터 쇼핑몰 동시 입점", "주문·정산을 한 곳에서 통합 관리", "티오로 크리에이터에게 제품 체험 기회"],
        cta: "입점 신청",
      },
    ],
  },
  services: {
    eyebrow: "SERVICES",
    title: "유튜브 비즈니스에 필요한 세 가지",
    advirtual: {
      num: "01 · ADVIRTUAL",
      name: "애드버추얼",
      tagline: "이미 만든 영상 위에, 광고를 얹다.",
      body: "방송 가상광고 기법으로 업로드된 콘텐츠의 사전 협의된 영역에 브랜드 소재를 오버레이합니다. 신제품·리뉴얼 제품의 인지와 호감 형성에 효과적이며, 유튜브 쇼핑으로 해당 화면에서 판매까지 이어집니다.",
      points: ["콘텐츠 제작비 없이 소재 제작비만", "사전 협의 영역 활용으로 영상 검수 최소화", "가상광고 기획·공동구매 구성·채널 모집 동시 진행"],
      chart: {
        title: "집행까지 걸리는 시간",
        ppl: "기존 PPL",
        pplValue: "평균 7~8주 · 최소 5주",
        av: "애드버추얼",
        avValue: "1주 이내",
        costPpl: "기존 PPL 비용",
        costPplValue: "콘텐츠 제작비 + 광고비",
        costAv: "애드버추얼 비용",
        costAvValue: "소재 제작비 + 광고비",
      },
    },
    shopping: {
      num: "02 · SHOPPING ALL-IN-ONE",
      name: "쇼핑올인원",
      tagline: "유튜버의 쇼핑몰, 처음부터 끝까지.",
      body: "유튜브 쇼핑으로 구독자에게 상품을 판매하려는 크리에이터를 위해 쇼핑몰 구축, 상품 소싱부터 C/S까지 운영 일체를 대행합니다. 브랜드는 한 번의 가입으로 여러 유튜버 쇼핑몰에 입점하고 주문·정산을 관리할 수 있습니다.",
      stepsTitle: "대범한사람들이 맡는 운영 범위",
      steps: ["쇼핑몰 구축", "상품 소싱·브랜드 입점", "주문·배송·정산 관리", "고객 C/S 응대"],
    },
    to: {
      num: "03 · TO (TRY-OUT)",
      name: "티오(TO)",
      tagline: "써보고, 자신 있게 추천하도록.",
      body: "구독자는 진정성 있는 추천에만 움직입니다. 티오는 크리에이터가 관심 있던 제품을 대가 없이 무료로 대여해 직접 검증하는 서비스입니다. 시장조사로 선별한 브랜드만 소개하고, 마음에 들면 브랜드 협의와 콘텐츠 기획까지 공동구매를 함께 준비합니다.",
      listLink: "대여 가능 제품 리스트",
      steps: [
        { title: "대여 신청", desc: "써보고 싶은 제품을 신청서로 고릅니다." },
        { title: "일정 조율", desc: "대범한사람들과 대여 일정을 맞춥니다." },
        { title: "수령 후 사용", desc: "별도 요구 없이 편하게 써봅니다." },
        { title: "반납 · 공구 제안", desc: "마음에 들면 공동구매 진행을 돕습니다." },
      ],
    },
  },
  team: {
    eyebrow: "TEAM",
    title: ["방송 광고와 데이터를", "직접 만들어 본 팀"],
    body: "소셜미디어 서비스 구축·운영, 빅데이터 분석, 온·오프라인 광고 비즈니스를 수행해 온 경험으로 소셜미디어 커머스 시장을 새롭게 개척하고 있습니다.",
    timeline: [
      { when: "초기", what: "네이트닷컴·싸이월드 서비스 런칭 및 운영" },
      { when: "2012", what: "데이터 분석 기업 창업" },
      { when: "2017", what: "CJ ENM에 엑싯(EXIT)" },
      {
        when: "CJ ENM",
        what: "미디어솔루션 부문 데이터솔루션센터 총괄",
        sub: "방송 광고 솔루션 구축·운영, 티빙 큐톤 광고 송출 시스템, 다이아TV 인플루언서 마케팅 플랫폼 다이아픽, 메조미디어 동영상 광고 네트워크 시그널플레이",
      },
      { when: "2020 ~", what: "(주)대범한사람들 설립 · 운영", strong: true },
    ],
  },
  press: { label: "PRESS", title: "대범한사람들, 크리에이터 커머스 대행 ‘유튜브 쇼핑 올인원 서비스’ 개시", cta: "기사 보기" },
  contact: {
    eyebrow: "CONTACT",
    title: ["유튜브 비즈니스,", "대범하게 시작해 보세요."],
    cards: [
      { type: "creator" as FormType, who: "크리에이터", label: "비즈니스 상담 신청" },
      { type: "advertiser" as FormType, who: "광고주", label: "광고 신청" },
      { type: "partner" as FormType, who: "상품 파트너", label: "입점 신청" },
    ],
    kakao: "카카오톡 채팅 상담",
  },
  footer: {
    company: "(주)대범한사람들",
    lines: ["대표 심성화 · 사업자등록번호 697-87-01842", "서울특별시 강남구 논현로115길 71, 604호", "전화 02-544-6290 · 메일 vigtiger@vigtiger.com"],
    copyright: "© VIGTIGER Inc. All rights reserved.",
  },
  apply: {
    back: "홈으로",
    eyebrow: "협업 신청",
    required: "필수",
    select: "선택해 주세요",
    name: "이름",
    email: "이메일",
    phone: "연락처",
    phonePh: "010-0000-0000",
    message: "추가로 전하고 싶은 내용",
    messagePh: "궁금한 점, 원하는 협업 방식 등을 자유롭게 적어 주세요.",
    privacyTitle: "개인정보 수집·이용 동의",
    privacyRows: [
      ["수집 항목", "이름(활동명), 이메일, 연락처, 회사·채널 정보, 문의 내용"],
      ["이용 목적", "협업 상담 및 회신"],
      ["보유 기간", "상담 종료 후 1년, 또는 동의 철회 시 즉시 파기"],
    ],
    privacyNote: "동의를 거부할 수 있으며, 거부 시 신청이 제한됩니다.",
    privacyAgree: "개인정보 수집·이용에 동의합니다.",
    submit: "신청서 보내기",
    submitting: "보내는 중…",
    successTitle: "신청이 접수되었습니다.",
    successBody: "담당자가 내용을 확인한 뒤 남겨주신 연락처로 회신드리겠습니다. 영업일 기준 2~3일 정도 걸릴 수 있어요.",
    successHome: "홈으로 돌아가기",
    errorRequired: "필수 항목을 확인해 주세요.",
    errorServer: "전송 중 문제가 생겼습니다. 잠시 후 다시 시도하거나 vigtiger@vigtiger.com 으로 연락해 주세요.",
    otherForms: "다른 신청서",
    types: {
      creator: {
        tag: "크리에이터",
        title: "크리에이터 비즈니스 상담 신청",
        intro: "채널 정보를 알려주시면 애드버추얼, 쇼핑올인원, 티오 중 채널에 맞는 수익화 방법을 제안드립니다.",
        short: "비즈니스 상담 신청",
      },
      advertiser: {
        tag: "광고주",
        title: "광고 신청",
        intro: "제품과 목표를 알려주시면 애드버추얼 가상 PPL과 크리에이터 공동구매 중 맞는 방식으로 집행안을 제안드립니다.",
        short: "광고 신청",
      },
      partner: {
        tag: "상품 파트너",
        title: "상품 파트너 입점 신청",
        intro: "브랜드와 상품을 알려주시면 유튜버 쇼핑몰 입점과 티오(무료 체험) 참여 방법을 안내드립니다.",
        short: "입점 신청",
      },
    } satisfies Record<FormType, { tag: string; title: string; intro: string; short: string }>,
  },
};

type Dict = typeof ko;

const en: Dict = {
  meta: {
    title: "VIGTIGER — Creator Commerce Partner",
    description:
      "VIGTIGER Inc. connects YouTube creators and brands through in-video advertising, commerce operations and product try-outs.",
  },
  nav: { about: "About", services: "Services", advirtual: "Advirtual", shopping: "Shopping All-in-One", to: "TO", team: "Team", contact: "Contact", cta: "Get in touch", switchTo: "한국어", menu: "Main menu", footerMenu: "Footer menu", mobileMenu: "Menu", privacy: "Privacy policy", more: "Learn more", home: "Home" },
  hero: {
    eyebrow: "Social commerce company · Since 2020",
    title: ["Turn creator influence", "into a business that sells."],
    body: "VIGTIGER helps YouTube creators and brands grow together — connecting advertising, commerce operations and product try-outs in one place.",
    primary: "Apply as a creator",
    secondary: "Advertise or partner with us",
    mock: {
      alt: "Example frame: a brand ad overlaid on an agreed area of a creator video, with a YouTube Shopping button",
      video: "A creator's existing video",
      adTag: "AD · OVERLAY",
      adTitle: "Brand creative",
      shopTitle: "View product",
      shopSub: "YouTube Shopping",
      caption: "Advirtual places your ad on an agreed area of videos that are already live — and YouTube Shopping turns views into purchases on the same screen.",
    },
  },
  stats: {
    label: "Key numbers",
    items: [
      { value: "84", unit: "", label: "YouTube channels we support" },
      { value: "9.92", unit: "M", label: "Combined subscribers" },
      { value: "80", unit: "+", label: "Brands in the TO program" },
      { value: "1", unit: " wk", label: "From go-ahead to live with Advirtual" },
    ],
    note: "Channels and subscribers as of 2025; TO brands as of April 2025.",
  },
  about: {
    eyebrow: "WHO WE WORK WITH",
    title: ["Creators, brands and product partners.", "We build a model where all three win."],
    body: "Since 2020 we have helped product suppliers and content creators start commerce easily inside social media.",
    cards: [
      {
        type: "creator",
        tag: "Creators",
        title: ["Keep making videos.", "We run the monetization."],
        points: ["Product placement revenue with minimal review hassle", "Your own store, operated for you", "Try products first, then recommend with confidence"],
        cta: "Book a consultation",
      },
      {
        type: "advertiser",
        tag: "Advertisers",
        title: ["Live within a week,", "selling — no production costs."],
        points: ["Ads overlaid on content with proven reach", "Instant purchase via YouTube Shopping", "Multi-channel recruiting and group-buys in parallel"],
        cta: "Request a campaign",
      },
      {
        type: "partner",
        tag: "Product partners",
        title: ["One sign-up,", "many creator stores."],
        points: ["Listed across multiple creator stores at once", "Orders and settlements managed in one place", "Product try-outs for creators via TO"],
        cta: "Apply to list products",
      },
    ],
  },
  services: {
    eyebrow: "SERVICES",
    title: "Three things every YouTube business needs",
    advirtual: {
      num: "01 · ADVIRTUAL",
      name: "Advirtual",
      tagline: "Your ad, placed on videos that already exist.",
      body: "Using broadcast virtual-advertising techniques, we overlay brand creative on a pre-agreed area of published videos. It's especially effective for building awareness and affinity for new or relaunched products — and YouTube Shopping lets viewers buy right from that screen.",
      points: ["Pay for creative only — no content production costs", "Pre-agreed placement areas keep video reviews to a minimum", "Ad planning, group-buy setup and channel recruiting run in parallel"],
      chart: {
        title: "Time to go live",
        ppl: "Traditional PPL",
        pplValue: "7–8 weeks avg · 5 weeks min",
        av: "Advirtual",
        avValue: "Within 1 week",
        costPpl: "Traditional PPL cost",
        costPplValue: "Content production + media",
        costAv: "Advirtual cost",
        costAvValue: "Creative production + media",
      },
    },
    shopping: {
      num: "02 · SHOPPING ALL-IN-ONE",
      name: "Shopping All-in-One",
      tagline: "A creator's store, end to end.",
      body: "For creators who want to sell to their subscribers through YouTube Shopping, we run everything — store setup, product sourcing, and customer service. Brands sign up once to be listed across many creator stores and manage orders and settlements in one place.",
      stepsTitle: "What we take care of",
      steps: ["Store setup", "Product sourcing & brand listings", "Orders, shipping & settlements", "Customer service"],
    },
    to: {
      num: "03 · TO (TRY-OUT)",
      name: "TO",
      tagline: "Try it first. Recommend it with confidence.",
      body: "Audiences only act on genuine recommendations. TO lends creators the products they've been curious about — free, with no strings attached — so they can test them first. We feature only brands selected through market research, and if a creator loves a product, we help set up the group-buy, from brand negotiation to content planning.",
      listLink: "See available products",
      steps: [
        { title: "Request", desc: "Pick the products you'd like to try." },
        { title: "Schedule", desc: "We agree on the rental period with you." },
        { title: "Use it", desc: "Try it freely — no obligations." },
        { title: "Return · Group-buy", desc: "Love it? We'll help you run a group-buy." },
      ],
    },
  },
  team: {
    eyebrow: "TEAM",
    title: ["A team that has built", "broadcast ads and data products"],
    body: "With experience building and running social media services, big-data analytics, and online and offline advertising businesses, we are opening up a new market for commerce inside social media.",
    timeline: [
      { when: "Early", what: "Launched and ran services at Nate.com and Cyworld" },
      { when: "2012", what: "Founded a data analytics company" },
      { when: "2017", what: "Exited to CJ ENM" },
      {
        when: "CJ ENM",
        what: "Head of the Data Solution Center, Media Solution Division",
        sub: "Built and ran broadcast ad solutions, the TVING Cue-tone ad delivery system, DIA TV's influencer marketing platform DIApick, and MezzoMedia's video ad network SignalPlay",
      },
      { when: "2020 –", what: "Founded and running VIGTIGER Inc.", strong: true },
    ],
  },
  press: { label: "PRESS", title: "VIGTIGER launches ‘YouTube Shopping All-in-One’, a commerce service for creators (Korean)", cta: "Read article" },
  contact: {
    eyebrow: "CONTACT",
    title: ["Start your YouTube business —", "boldly."],
    cards: [
      { type: "creator", who: "Creators", label: "Book a consultation" },
      { type: "advertiser", who: "Advertisers", label: "Request a campaign" },
      { type: "partner", who: "Product partners", label: "Apply to list products" },
    ],
    kakao: "Chat on KakaoTalk",
  },
  footer: {
    company: "VIGTIGER Inc. (대범한사람들)",
    lines: ["CEO Sungwha Shim · Business reg. no. 697-87-01842", "604, 71 Nonhyeon-ro 115-gil, Gangnam-gu, Seoul, Korea", "+82-2-544-6290 · vigtiger@vigtiger.com"],
    copyright: "© VIGTIGER Inc. All rights reserved.",
  },
  apply: {
    back: "Home",
    eyebrow: "Work with us",
    required: "Required",
    select: "Please select",
    name: "Name",
    email: "Email",
    phone: "Phone",
    phonePh: "+82 10-0000-0000",
    message: "Anything else you'd like to share",
    messagePh: "Questions, the kind of collaboration you have in mind, timelines…",
    privacyTitle: "Consent to collect and use personal information",
    privacyRows: [
      ["What we collect", "Name, email, phone, company or channel details, your message"],
      ["Why", "To review your request and get back to you"],
      ["How long", "One year after the consultation ends, or until you withdraw consent"],
    ],
    privacyNote: "You may decline, but we won't be able to process your request without it.",
    privacyAgree: "I agree to the collection and use of my personal information.",
    submit: "Send application",
    submitting: "Sending…",
    successTitle: "Thank you — we've received your application.",
    successBody: "Our team will review it and get back to you at the contact details you provided, usually within 2–3 business days.",
    successHome: "Back to home",
    errorRequired: "Please check the required fields.",
    errorServer: "Something went wrong while sending. Please try again shortly, or email vigtiger@vigtiger.com.",
    otherForms: "Other forms",
    types: {
      creator: {
        tag: "Creators",
        title: "Creator consultation",
        intro: "Tell us about your channel and we'll suggest the right way to monetize — Advirtual, Shopping All-in-One or TO.",
        short: "Book a consultation",
      },
      advertiser: {
        tag: "Advertisers",
        title: "Campaign request",
        intro: "Tell us about your product and goals, and we'll propose a plan using Advirtual placements, creator group-buys, or both.",
        short: "Request a campaign",
      },
      partner: {
        tag: "Product partners",
        title: "Product partner application",
        intro: "Tell us about your brand and products, and we'll walk you through listing in creator stores and joining TO try-outs.",
        short: "Apply to list products",
      },
    },
  },
};

export const dictionaries: Record<Lang, Dict> = { ko, en };
export const getDict = (lang: Lang) => dictionaries[lang];
export type { Dict };
