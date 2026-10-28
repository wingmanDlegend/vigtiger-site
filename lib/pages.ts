// 서브 페이지(회사소개, 서비스 3종, 개인정보처리방침) 문구 — 한/영
import type { Lang } from "./forms";

const ko = {
  about: {
    meta: {
      title: "회사소개 — 대범한사람들",
      description: "2020년 설립된 소셜 커머스 전문 기업 (주)대범한사람들을 소개합니다.",
    },
    eyebrow: "회사소개",
    title: ["소셜미디어 안에서,", "누구나 쉽게 커머스를."],
    lead: "주식회사 대범한사람들은 2020년에 설립되었습니다. 상품 공급사와 콘텐츠 크리에이터가 소셜미디어 안에서 쉽게 커머스 비즈니스를 할 수 있도록 지원하고 있습니다.",
    overviewTitle: "회사 개요",
    overview: [
      ["회사명", "(주)대범한사람들 (VIGTIGER Inc.)"],
      ["설립", "2020년"],
      ["대표", "심성화"],
      ["사업 분야", "크리에이터 커머스 · 유튜브 광고 · 크리에이터 제품 체험"],
      ["소재지", "서울특별시 강남구 논현로115길 71, 604호"],
      ["문의", "02-544-6290 · vigtiger@vigtiger.com"],
    ],
    why: {
      eyebrow: "WHY CREATOR COMMERCE",
      title: "왜 크리에이터 커머스인가",
      body: "소셜미디어는 사고 싶은 제품을 발견하는 공간이 되었고, 구독자는 믿고 보는 크리에이터의 추천에 움직입니다. 크리에이터에게 커머스는 1회성 광고보다 오래가는 수익이 되고, 브랜드에게는 진정성 있는 판매 채널이 됩니다.",
      stats: [
        { value: "70%", label: "고소득 크리에이터 수익 중 브랜드 협업에서 나오는 비중" },
        { value: "45%", label: "소셜미디어에서 신제품을 발견하고 구매하는 Z세대" },
        { value: "2022.11", label: "한국 유튜브 쇼핑 런칭" },
      ],
      note: "대범한사람들 서비스 소개 자료 기준",
    },
    whatTitle: "우리가 하는 일",
    whatLead: "크리에이터와 브랜드가 유튜브에서 함께 돈을 버는 데 필요한 세 가지 서비스를 운영합니다.",
    growthTitle: "크리에이터의 성장을 함께합니다",
    growthBody: "2025년 대범한사람들은 누적 구독자 992만 명, 84개 유튜브 채널의 비즈니스를 지원하고 있습니다.",
    closing: "앞으로의 대범한사람들의 발걸음을 지켜봐 주십시오.",
    signature: "대범한사람들 임직원 일동",
  },

  advirtual: {
    meta: {
      title: "애드버추얼 — 대범한사람들",
      description: "이미 만든 유튜브 영상 위에 광고를 얹는 가상 PPL. 결정 후 1주일 안에 집행하고 유튜브 쇼핑으로 판매까지 연결합니다.",
    },
    eyebrow: "SERVICE 01 · ADVIRTUAL",
    title: ["이미 만든 영상 위에,", "광고를 얹다."],
    lead: "애드버추얼은 PPL과 상품 판매를 동시에 제공하는 유튜브 광고 상품입니다. 간편한 PPL 적용과 합리적인 가격으로 유튜버와 브랜드 모두 만족하는 광고를 만듭니다.",
    ctaPrimary: "광고 신청",
    ctaSecondary: "크리에이터로 참여하기",
    how: {
      eyebrow: "HOW IT WORKS",
      title: "방송 가상광고 기법을 유튜브로",
      steps: [
        { title: "광고 영역 확보", desc: "크리에이터와 사전에 협의한 영상 속 일부 영역을 광고 공간으로 확보합니다." },
        { title: "소재 제작·오버레이", desc: "브랜드 광고 소재를 만들어 이미 업로드된 콘텐츠 위에 얹습니다." },
        { title: "노출과 판매", desc: "브랜드와 제품을 노출하고, 유튜브 쇼핑으로 같은 화면에서 판매까지 연결합니다." },
      ],
    },
    fit: {
      title: "이럴 때 특히 효과적이에요",
      items: ["새로 출시하거나 리뉴얼한 제품·브랜드", "‘제품 인지’ 단계에서 노출을 넓히고 싶을 때", "‘브랜드 호감 형성’ 단계에서 신뢰를 쌓고 싶을 때"],
    },
    advertiser: {
      eyebrow: "FOR ADVERTISERS",
      title: "광고주에게 주는 장점",
      items: [
        {
          title: "Ready-To-Go",
          lead: "프로젝트 결정 후 1주일 안에 집행",
          body: "기존 PPL은 콘텐츠에 광고를 녹이는 과정 때문에 최소 5주, 평균 7~8주가 걸립니다. 애드버추얼은 콘텐츠에 할당받은 인벤토리를 쓰기 때문에 불필요한 협의 없이 1주일 안에 집행됩니다.",
        },
        {
          title: "합리적인 가격",
          lead: "콘텐츠 제작비를 부담하지 않습니다",
          body: "기존 PPL은 광고가 들어간 새 콘텐츠를 만들기 때문에 콘텐츠 제작비까지 더해집니다. 애드버추얼은 이미 만든 콘텐츠에 소재를 얹기 때문에 소재 제작비 외에는 제작비가 들지 않습니다.",
        },
      ],
    },
    creator: {
      eyebrow: "FOR CREATORS",
      title: "크리에이터에게 주는 장점",
      headline: "영상 제작에 집중할 수 있는 환경",
      body: "영상 속 광고 수익의 비중은 커지지만, 광고를 영상에 녹이는 부담도 함께 커지고 있습니다. 애드버추얼은 사전 협의된 영역에만 광고가 노출되므로 영상을 검수받는 과정이 크게 줄어듭니다. 수익은 만들고, 제작에는 더 집중하세요.",
      points: ["새로 촬영하거나 편집할 필요 없는 PPL", "사전 협의된 영역만 사용해 검수 부담 최소화", "유튜브 쇼핑 판매까지 이어지는 추가 수익"],
    },
    process: {
      eyebrow: "PROCESS",
      title: "1주일 안에, 동시에 진행합니다",
      body: "가상광고 기획·제작, 공동구매 구성, 채널 모집을 한꺼번에 진행해 빠르게 프로모션을 시작합니다.",
      tracks: ["가상광고 기획·제작", "공동구매 구성", "채널 모집"],
      start: "프로젝트 결정",
      end: "집행 시작",
      within: "1주일 이내",
    },
  },

  shopping: {
    meta: {
      title: "쇼핑올인원 — 대범한사람들",
      description: "유튜버의 쇼핑몰 구축, 상품 소싱부터 C/S까지 운영 일체를 대행하는 크리에이터 맞춤형 커머스 서비스.",
    },
    eyebrow: "SERVICE 02 · SHOPPING ALL-IN-ONE",
    title: ["유튜버의 쇼핑몰,", "처음부터 끝까지."],
    lead: "쇼핑올인원은 유튜브에서 커머스 비즈니스를 하려는 유튜버와 브랜드를 위한 맞춤형 커머스 대행 서비스입니다.",
    ctaPrimary: "크리에이터 상담 신청",
    ctaSecondary: "브랜드 입점 신청",
    why: {
      eyebrow: "WHY NOW",
      title: "구독자와 만나는 새로운 방법, 유튜브 쇼핑",
      body: [
        "MZ세대를 중심으로 SNS에서 쇼핑하는 ‘소셜커머스’가 주목받고 있습니다. 소셜미디어는 사려는 제품을 발견하는 공간이 되었습니다.",
        "2022년 11월, 유튜버가 구독자에게 직접 상품을 판매할 수 있는 유튜브 쇼핑이 한국에 런칭했습니다. 콘텐츠와 함께 상품이 노출되면서 구독자와의 교류가 넓어지고, 자연스럽게 판매로 이어집니다.",
      ],
      stats: [
        { value: "45%", label: "소셜미디어에서 신제품을 발견하고 구매하는 Z세대" },
        { value: "2022.11", label: "한국 유튜브 쇼핑 런칭" },
      ],
    },
    roles: {
      eyebrow: "WHO DOES WHAT",
      title: "크리에이터는 콘텐츠와 추천에만 집중하세요",
      creator: { title: "크리에이터", items: ["콘텐츠 기획·제작", "구독자에게 상품 추천"] },
      us: { title: "대범한사람들", items: ["쇼핑몰 구축·유튜브 쇼핑 연동", "채널에 맞는 상품 소싱·브랜드 입점", "주문·배송·정산 관리", "고객 C/S 응대"] },
    },
    brands: {
      eyebrow: "FOR BRANDS",
      title: "한 번의 입점으로 여러 유튜버 쇼핑몰에",
      items: [
        { title: "다수 채널 동시 입점", body: "서비스 가입 한 번으로 여러 유튜버 쇼핑몰에 상품을 입점할 수 있습니다." },
        { title: "주문·정산 통합 관리", body: "채널마다 따로 챙길 필요 없이 주문과 정산을 한 곳에서 관리합니다." },
        { title: "티오로 먼저 체험", body: "티오(TO)에 참여하면 크리에이터가 제품을 먼저 써보고 판매를 결정합니다." },
      ],
    },
    flow: {
      eyebrow: "PROCESS",
      title: "이렇게 시작합니다",
      steps: [
        { title: "상담 신청", desc: "채널과 원하는 판매 방식을 알려주세요." },
        { title: "상품 구성", desc: "채널 성격과 구독자에 맞는 상품을 함께 고릅니다." },
        { title: "쇼핑몰 오픈", desc: "쇼핑몰을 만들고 유튜브 쇼핑과 연결합니다." },
        { title: "판매·운영", desc: "주문·배송·C/S·정산은 대범한사람들이 맡습니다." },
      ],
    },
  },

  to: {
    meta: {
      title: "티오(TO) — 대범한사람들",
      description: "크리에이터를 위한 무료 제품 대여 서비스. 먼저 써보고, 마음에 드는 제품만 자신 있게 추천하세요.",
    },
    eyebrow: "SERVICE 03 · TO (TRY-OUT)",
    title: ["써보고,", "자신 있게 추천하도록."],
    lead: "티오(TO)는 크리에이터를 위한 무료 제품 대여 서비스입니다. 구독자에게 소개하고 싶었던 제품을 대가 없이 먼저 써보고, 추천할지 결정하세요.",
    nameNote: "티오(TO)는 Try-Out의 약어로 ‘시험 삼아 해 보다’라는 뜻입니다.",
    ctaPrimary: "티오 대여 신청",
    ctaSecondary: "브랜드로 참여하기",
    why: {
      eyebrow: "WHY TO",
      title: "진정성 있는 추천만이 구독자를 움직입니다",
      body: [
        "좋아하는 인물이나 콘텐츠에 나온 제품을 그대로 따라 사는 소비가 늘고 있습니다. 하지만 더 똑똑해진 소비자는 광고주의 메시지가 아니라 인플루언서의 진정성 있는 추천에만 움직입니다.",
        "크리에이터에게 커머스는 1회성 광고보다 지속적인 수익을 만드는 방법입니다. 하지만 좋은 상품을 찾고, 직접 검증하고, 판매 조건을 협의하는 일은 시간과 비용이 많이 들어 특히 소규모 채널에게는 시작이 쉽지 않습니다.",
      ],
      stat: { value: "70%", label: "고소득 크리에이터 수익 중 브랜드 협업에서 나오는 비중" },
    },
    pillars: {
      eyebrow: "WHAT IT TAKES",
      title: "성공적인 크리에이터 커머스의 세 가지 조건",
      items: ["가격과 품질이 좋은 상품을 고른다", "크리에이터가 직접 써보고 가치를 검증한다", "공급사와 협의해 가치 있는 구매 혜택을 준비한다"],
      note: "티오는 이 세 가지에 필요한 과정을 처음부터 함께합니다.",
    },
    diff: {
      eyebrow: "DIFFERENCE",
      title: "티오는 이런 점이 다릅니다",
      items: [
        { title: "요즘 뜨는 브랜드만", body: "시장조사로 선별한 브랜드의 제품만 대여해 드립니다." },
        { title: "조건 없는 대여", body: "제품을 대여해 드리지만 별도의 요구는 없습니다." },
        { title: "공구까지 원스톱", body: "써보고 판매하고 싶다면 브랜드 협의와 콘텐츠 기획부터 좋은 조건으로 판매할 수 있게 돕습니다." },
      ],
    },
    brands: {
      value: "80",
      unit: "개",
      title: "브랜드가 티오에 참여하고 있어요",
      note: "2025년 4월 기준",
      productList: "대여 가능 제품 리스트 보기",
      subscribe: "신규 제품 소식 받기",
      subscribeBody: "MD가 시장조사로 고른 새 제품 소식을 받아보고, 관심 가는 제품은 무료로 대여해 보세요.",
    },
    stepsTitle: "이용 방법",
  },

  privacy: {
    meta: { title: "개인정보처리방침 — 대범한사람들", description: "(주)대범한사람들 홈페이지 개인정보처리방침" },
    title: "개인정보처리방침",
    effective: "시행일: 2026년 10월 28일",
    intro:
      "(주)대범한사람들(이하 ‘회사’)은 「개인정보 보호법」 등 관련 법령을 지키며, 홈페이지 협업 신청서를 통해 받은 개인정보를 아래와 같이 처리합니다.",
    sections: [
      {
        h: "1. 수집하는 개인정보 항목과 방법",
        p: [
          "필수: 이름(활동명), 이메일. 선택: 연락처, 회사·브랜드·채널 정보(채널명·URL·구독자 규모 등), 문의 내용.",
          "홈페이지의 크리에이터·광고주·상품 파트너 신청서를 통해 이용자가 직접 입력한 정보만 수집합니다.",
        ],
      },
      { h: "2. 이용 목적", p: ["협업 상담 신청 확인, 상담 진행 및 회신, 서비스 제안"] },
      {
        h: "3. 보유 및 이용 기간",
        p: ["상담 종료 후 1년간 보관한 뒤 파기합니다. 이용자가 동의를 철회하면 지체 없이 파기합니다. 다만 관련 법령에 따라 보존해야 하는 경우에는 해당 기간 동안 보관합니다."],
      },
      { h: "4. 제3자 제공", p: ["회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다."] },
      {
        h: "5. 처리 위탁",
        p: [
          "Supabase, Inc. — 신청서 데이터 저장 및 관리 (저장 위치: 대한민국 서울 리전)",
          "Vercel, Inc. — 홈페이지 호스팅 및 신청서 전송 처리",
        ],
      },
      {
        h: "6. 파기 절차와 방법",
        p: ["보유 기간이 지나거나 처리 목적이 달성된 개인정보는 복구할 수 없는 방법으로 지체 없이 삭제합니다."],
      },
      {
        h: "7. 이용자의 권리",
        p: ["이용자는 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 아래 연락처로 요청하시면 지체 없이 조치하겠습니다."],
      },
      {
        h: "8. 안전성 확보 조치",
        p: ["신청서 데이터는 암호화된 통신(HTTPS)으로 전송되며, 접근 권한이 있는 담당자만 조회할 수 있도록 관리합니다."],
      },
      {
        h: "9. 개인정보 보호책임자",
        p: ["성명: 심성화 (대표이사)", "이메일: vigtiger@vigtiger.com · 전화: 02-544-6290"],
      },
      {
        h: "10. 고지 의무",
        p: ["이 방침의 내용이 바뀌면 시행 7일 전부터 홈페이지를 통해 알립니다."],
      },
    ],
  },
};

type Pages = typeof ko;

const en: Pages = {
  about: {
    meta: {
      title: "About — VIGTIGER",
      description: "Meet VIGTIGER Inc., a social commerce company founded in 2020.",
    },
    eyebrow: "About us",
    title: ["Commerce inside social media,", "made easy for everyone."],
    lead: "VIGTIGER Inc. was founded in 2020. We help product suppliers and content creators run commerce businesses easily inside social media.",
    overviewTitle: "Company overview",
    overview: [
      ["Company", "VIGTIGER Inc. (대범한사람들)"],
      ["Founded", "2020"],
      ["CEO", "Sungwha Shim"],
      ["Business", "Creator commerce · YouTube advertising · Creator product try-outs"],
      ["Address", "604, 71 Nonhyeon-ro 115-gil, Gangnam-gu, Seoul, Korea"],
      ["Contact", "+82-2-544-6290 · vigtiger@vigtiger.com"],
    ],
    why: {
      eyebrow: "WHY CREATOR COMMERCE",
      title: "Why creator commerce",
      body: "Social media has become where people discover what they want to buy, and audiences act on recommendations from creators they trust. For creators, commerce is longer-lasting income than one-off ads; for brands, it's a sales channel built on authenticity.",
      stats: [
        { value: "70%", label: "Share of top creators' income that comes from brand collaborations" },
        { value: "45%", label: "Gen Z who discover and buy new products on social media" },
        { value: "Nov 2022", label: "YouTube Shopping launched in Korea" },
      ],
      note: "Based on VIGTIGER service materials",
    },
    whatTitle: "What we do",
    whatLead: "We run three services that help creators and brands earn together on YouTube.",
    growthTitle: "Growing together with creators",
    growthBody: "In 2025, VIGTIGER supports the businesses of 84 YouTube channels with 9.92 million combined subscribers.",
    closing: "We look forward to the road ahead — thank you for following our journey.",
    signature: "The VIGTIGER team",
  },

  advirtual: {
    meta: {
      title: "Advirtual — VIGTIGER",
      description: "Virtual product placement on YouTube videos that already exist. Live within a week, with sales through YouTube Shopping.",
    },
    eyebrow: "SERVICE 01 · ADVIRTUAL",
    title: ["Your ad, placed on videos", "that already exist."],
    lead: "Advirtual is a YouTube ad product that combines product placement with product sales. Easy placement and fair pricing make it work for both creators and brands.",
    ctaPrimary: "Request a campaign",
    ctaSecondary: "Join as a creator",
    how: {
      eyebrow: "HOW IT WORKS",
      title: "Broadcast virtual advertising, brought to YouTube",
      steps: [
        { title: "Secure ad space", desc: "We reserve a part of the frame in videos, agreed with the creator in advance." },
        { title: "Create & overlay", desc: "We produce your brand creative and overlay it on content that's already published." },
        { title: "Exposure & sales", desc: "Your brand gets seen, and YouTube Shopping turns views into purchases on the same screen." },
      ],
    },
    fit: {
      title: "Especially effective when",
      items: ["You're launching or relaunching a product or brand", "You need reach at the product-awareness stage", "You want to build trust at the brand-affinity stage"],
    },
    advertiser: {
      eyebrow: "FOR ADVERTISERS",
      title: "What advertisers get",
      items: [
        {
          title: "Ready-To-Go",
          lead: "Live within a week of your go-ahead",
          body: "Traditional PPL takes at least 5 weeks — 7 to 8 on average — because the ad has to be built into new content. Advirtual uses inventory already allocated in existing videos, so campaigns go live within a week without lengthy negotiations.",
        },
        {
          title: "Fair pricing",
          lead: "No content production costs",
          body: "Traditional PPL means paying for a brand-new video on top of the ad itself. Advirtual overlays your creative on content that already exists, so the only production cost is the creative.",
        },
      ],
    },
    creator: {
      eyebrow: "FOR CREATORS",
      title: "What creators get",
      headline: "More time to focus on making videos",
      body: "Ad income is a growing share of creator revenue — and so is the hassle of weaving ads into videos. With Advirtual, ads only appear in a pre-agreed area, so video reviews drop dramatically. Keep earning, and keep your focus on creating.",
      points: ["Product placement with no reshoots or re-edits", "Pre-agreed placement areas keep reviews to a minimum", "Extra income from YouTube Shopping sales"],
    },
    process: {
      eyebrow: "PROCESS",
      title: "Everything in parallel, within a week",
      body: "Ad planning and production, group-buy setup and channel recruiting all run at once, so your promotion starts fast.",
      tracks: ["Ad planning & production", "Group-buy setup", "Channel recruiting"],
      start: "Go-ahead",
      end: "Campaign live",
      within: "Within 1 week",
    },
  },

  shopping: {
    meta: {
      title: "Shopping All-in-One — VIGTIGER",
      description: "A commerce service that runs creator stores end to end — store setup, product sourcing, and customer service.",
    },
    eyebrow: "SERVICE 02 · SHOPPING ALL-IN-ONE",
    title: ["A creator's store,", "end to end."],
    lead: "Shopping All-in-One is a tailored commerce service for creators and brands who want to do business on YouTube.",
    ctaPrimary: "Apply as a creator",
    ctaSecondary: "Apply as a brand",
    why: {
      eyebrow: "WHY NOW",
      title: "A new way to meet your audience: YouTube Shopping",
      body: [
        "Social commerce — shopping on social media — is taking off, led by Millennials and Gen Z. Social media is now where people discover the products they buy.",
        "In November 2022, YouTube Shopping launched in Korea, letting creators sell directly to their subscribers. Products appear alongside content, deepening the connection with viewers and turning it naturally into sales.",
      ],
      stats: [
        { value: "45%", label: "Gen Z who discover and buy new products on social media" },
        { value: "Nov 2022", label: "YouTube Shopping launched in Korea" },
      ],
    },
    roles: {
      eyebrow: "WHO DOES WHAT",
      title: "Creators focus on content and recommendations",
      creator: { title: "Creator", items: ["Plan and produce content", "Recommend products to subscribers"] },
      us: { title: "VIGTIGER", items: ["Store setup and YouTube Shopping integration", "Product sourcing and brand listings for your channel", "Orders, shipping and settlements", "Customer service"] },
    },
    brands: {
      eyebrow: "FOR BRANDS",
      title: "One sign-up, many creator stores",
      items: [
        { title: "List across many channels", body: "A single sign-up gets your products into multiple creator stores." },
        { title: "One place for orders and settlements", body: "No need to manage each channel separately — orders and settlements are handled in one place." },
        { title: "Try-outs with TO", body: "Join TO and creators test your product first before deciding to sell it." },
      ],
    },
    flow: {
      eyebrow: "PROCESS",
      title: "How to get started",
      steps: [
        { title: "Apply", desc: "Tell us about your channel and how you'd like to sell." },
        { title: "Curate", desc: "We pick products that fit your channel and audience together." },
        { title: "Open the store", desc: "We set up your store and connect it to YouTube Shopping." },
        { title: "Sell & operate", desc: "Orders, shipping, customer service and settlements are on us." },
      ],
    },
  },

  to: {
    meta: {
      title: "TO (Try-Out) — VIGTIGER",
      description: "Free product try-outs for creators. Test products first, then recommend only what you love.",
    },
    eyebrow: "SERVICE 03 · TO (TRY-OUT)",
    title: ["Try it first.", "Recommend it with confidence."],
    lead: "TO is a free product lending service for creators. Try the products you've wanted to introduce to your subscribers — at no cost — and then decide whether to recommend them.",
    nameNote: "TO is short for Try-Out.",
    ctaPrimary: "Request a try-out",
    ctaSecondary: "Join as a brand",
    why: {
      eyebrow: "WHY TO",
      title: "Only genuine recommendations move audiences",
      body: [
        "More and more people buy the products they see from the creators and content they love. But today's smarter consumers respond to an influencer's genuine recommendation — not to an advertiser's message.",
        "For creators, commerce builds lasting income in a way one-off ads can't. But finding good products, testing them, and negotiating terms takes time and money — which makes it hard to start, especially for smaller channels.",
      ],
      stat: { value: "70%", label: "Share of top creators' income that comes from brand collaborations" },
    },
    pillars: {
      eyebrow: "WHAT IT TAKES",
      title: "Three conditions for successful creator commerce",
      items: ["Choose products with great price and quality", "Have the creator use them and validate their value", "Agree on worthwhile deals with the supplier"],
      note: "TO supports every step these three require, from the very beginning.",
    },
    diff: {
      eyebrow: "DIFFERENCE",
      title: "What makes TO different",
      items: [
        { title: "Only brands on the rise", body: "We lend products only from brands selected through market research." },
        { title: "No strings attached", body: "We lend you the product with no further requirements." },
        { title: "Group-buys, end to end", body: "Want to sell after trying? We help with brand negotiation and content planning so you sell on the best terms." },
      ],
    },
    brands: {
      value: "80",
      unit: "",
      title: "brands are part of TO",
      note: "As of April 2025",
      productList: "See available products",
      subscribe: "Get new product updates",
      subscribeBody: "Get updates on new products our MDs select through market research — and borrow the ones you like for free.",
    },
    stepsTitle: "How it works",
  },

  privacy: {
    meta: { title: "Privacy Policy — VIGTIGER", description: "VIGTIGER Inc. website privacy policy" },
    title: "Privacy Policy",
    effective: "Effective: October 28, 2026",
    intro:
      "VIGTIGER Inc. (the “Company”) complies with Korea’s Personal Information Protection Act and related laws, and processes the personal information received through the application forms on this website as follows.",
    sections: [
      {
        h: "1. What we collect and how",
        p: [
          "Required: name (or creator name) and email. Optional: phone, company/brand/channel details (channel name, URL, audience size, etc.) and your message.",
          "We only collect what you enter yourself in the creator, advertiser and product partner application forms.",
        ],
      },
      { h: "2. Why we use it", p: ["To confirm your application, hold consultations, reply to you, and propose services."] },
      {
        h: "3. How long we keep it",
        p: ["We keep it for one year after the consultation ends and then delete it. If you withdraw consent, we delete it without delay, unless the law requires us to keep it for a set period."],
      },
      { h: "4. Sharing with third parties", p: ["We do not share your personal information with third parties without your consent."] },
      {
        h: "5. Service providers",
        p: [
          "Supabase, Inc. — stores and manages application data (stored in the Seoul, Korea region)",
          "Vercel, Inc. — hosts the website and processes form submissions",
        ],
      },
      { h: "6. Deletion", p: ["Information past its retention period, or no longer needed, is deleted promptly in a way that cannot be recovered."] },
      {
        h: "7. Your rights",
        p: ["You can ask to access, correct, delete, or stop the processing of your information at any time. Contact us below and we will act without delay."],
      },
      {
        h: "8. Security",
        p: ["Application data is sent over encrypted connections (HTTPS), and only authorized staff can view it."],
      },
      {
        h: "9. Privacy officer",
        p: ["Name: Sungwha Shim (CEO)", "Email: vigtiger@vigtiger.com · Phone: +82-2-544-6290"],
      },
      { h: "10. Changes", p: ["If this policy changes, we will post a notice on this website at least 7 days before it takes effect."] },
    ],
  },
};

export const pages: Record<Lang, Pages> = { ko, en };
export const getPages = (lang: Lang) => pages[lang];
