// 홈페이지 재미 요소(퀴즈·전후 비교·호랑이·띠 배너) 문구 — 한/영
import type { Lang } from "@/lib/forms";

export type ServiceKey = "advirtual" | "shopping" | "to";

type QuizOption = { label: string; score: Partial<Record<ServiceKey, number>> };
type QuizQuestion = { q: string; options: QuizOption[] };

const ko = {
  compare: {
    before: "원본 영상",
    after: "애드버추얼 적용",
    hint: "좌우로 밀어 보세요",
    sliderLabel: "원본 영상과 애드버추얼 적용 화면 비교",
  },
  marquee: [
    "가상 PPL",
    "크리에이터 쇼핑몰",
    "무료 제품 대여",
    "공동구매",
    "84개 유튜브 채널",
    "누적 구독자 992만",
    "티오 참여 브랜드 80+",
    "결정부터 집행까지 1주",
  ],
  quiz: {
    eyebrow: "크리에이터라면",
    title: ["30초 만에 찾는", "나에게 맞는 서비스"],
    body: "질문 3개에 답하면 대범한사람들의 서비스 중 지금 채널에 가장 잘 맞는 것을 골라 드려요.",
    start: "시작하기",
    step: (n: number, total: number) => `${n} / ${total}`,
    back: "이전",
    resultEyebrow: "추천 서비스",
    apply: "이 서비스로 상담 신청",
    more: "자세히 보기",
    retry: "다시 해 보기",
    questions: [
      {
        q: "지금 가장 원하는 건 무엇인가요?",
        options: [
          { label: "올려 둔 영상으로 광고 수익을 더 내고 싶어요", score: { advirtual: 3 } },
          { label: "내 이름을 건 쇼핑몰·브랜드를 갖고 싶어요", score: { shopping: 3 } },
          { label: "콘텐츠에 쓸 제품을 부담 없이 받아 보고 싶어요", score: { to: 3 } },
        ],
      },
      {
        q: "채널에 영상이 얼마나 쌓여 있나요?",
        options: [
          { label: "100개 넘게 쌓여 있어요", score: { advirtual: 2, shopping: 1 } },
          { label: "꾸준히 늘려 가는 중이에요", score: { to: 1, shopping: 1 } },
          { label: "이제 막 시작했어요", score: { to: 2 } },
        ],
      },
      {
        q: "제품을 팔아 본 적이 있나요?",
        options: [
          { label: "공동구매·판매를 해 봤어요", score: { shopping: 2 } },
          { label: "해 보고 싶지만 아직이에요", score: { shopping: 1, to: 1 } },
          { label: "판매보다는 콘텐츠에 집중하고 싶어요", score: { advirtual: 1, to: 1 } },
        ],
      },
    ] as QuizQuestion[],
    results: {
      advirtual: {
        name: "애드버추얼",
        line: "이미 올린 영상이 새 광고 지면이 돼요",
        why: "다시 촬영할 필요 없이, 기존 영상에 브랜드 광고를 가상으로 넣어 추가 수익을 만들어요.",
      },
      shopping: {
        name: "쇼핑올인원",
        line: "내 쇼핑몰, 운영은 맡기고 판매에만 집중",
        why: "상품 소싱부터 상세페이지·배송·CS까지 대신 운영해서, 크리에이터는 콘텐츠와 판매에만 집중하면 돼요.",
      },
      to: {
        name: "티오(TO)",
        line: "써 보고 싶은 제품을 무료로 빌려 써 보세요",
        why: "브랜드 제품을 무료로 대여해 콘텐츠를 만들고, 마음에 들면 공동구매로 이어 갈 수 있어요.",
      },
    } as Record<ServiceKey, { name: string; line: string; why: string }>,
  },
  tiger: {
    peek: "같이 대범하게 가 볼까요?",
    roar: "어흥!",
    label: "대범한사람들 호랑이",
    done: "접수 완료!",
  },
};

const en: typeof ko = {
  compare: {
    before: "Original",
    after: "With Advirtual",
    hint: "Drag to compare",
    sliderLabel: "Compare the original video with the Advirtual version",
  },
  marquee: [
    "Virtual product placement",
    "Creator stores",
    "Free product try-outs",
    "Group-buys",
    "84 YouTube channels",
    "9.92M combined subscribers",
    "80+ TO brands",
    "Live within 1 week",
  ],
  quiz: {
    eyebrow: "For creators",
    title: ["Find the right service", "in 30 seconds"],
    body: "Answer three questions and we'll suggest which VIGTIGER service fits your channel best right now.",
    start: "Start",
    step: (n: number, total: number) => `${n} / ${total}`,
    back: "Back",
    resultEyebrow: "Our pick for you",
    apply: "Apply for this service",
    more: "Learn more",
    retry: "Try again",
    questions: [
      {
        q: "What do you want most right now?",
        options: [
          { label: "More ad revenue from videos I've already posted", score: { advirtual: 3 } },
          { label: "My own store or brand", score: { shopping: 3 } },
          { label: "Products to try in my content, hassle-free", score: { to: 3 } },
        ],
      },
      {
        q: "How many videos are on your channel?",
        options: [
          { label: "More than 100", score: { advirtual: 2, shopping: 1 } },
          { label: "Growing steadily", score: { to: 1, shopping: 1 } },
          { label: "Just getting started", score: { to: 2 } },
        ],
      },
      {
        q: "Have you sold products before?",
        options: [
          { label: "Yes, group-buys or sales", score: { shopping: 2 } },
          { label: "Not yet, but I'd like to", score: { shopping: 1, to: 1 } },
          { label: "I'd rather focus on content", score: { advirtual: 1, to: 1 } },
        ],
      },
    ],
    results: {
      advirtual: {
        name: "Advirtual",
        line: "Your existing videos become new ad space",
        why: "We place brand ads into videos you've already published — no reshoots — so they keep earning.",
      },
      shopping: {
        name: "Shopping All-in-One",
        line: "Your store, run for you",
        why: "We handle sourcing, product pages, shipping and customer service, so you can focus on content and selling.",
      },
      to: {
        name: "TO",
        line: "Borrow the products you want to try — free",
        why: "Borrow brand products for free to make content, and turn the ones you love into group-buys.",
      },
    },
  },
  tiger: {
    peek: "Let's be bold together!",
    roar: "ROAR!",
    label: "VIGTIGER tiger",
    done: "Got it!",
  },
};

export const getFun = (lang: Lang) => (lang === "en" ? en : ko);
