import type { Metadata, Viewport } from "next";
import "../globals.css";
import "./to.css";
import Analytics from "@/components/Analytics";
import { TO_URL } from "@/lib/tosite/site";

// to.vigtiger.com — 크리에이터용 티오(TO) 사이트 (proxy.ts 에서 /tosite 로 연결)

export const metadata: Metadata = {
  metadataBase: new URL(TO_URL),
  title: { default: "티오(TO) — 크리에이터 무료 제품 대여 · 대범한사람들", template: "%s · 티오(TO)" },
  description: "크리에이터를 위한 무료 제품 대여 서비스 티오(TO). 이번 주 추천 제품과 핫딜, 전체 대여·협찬 가능 제품을 보고 바로 신청하세요.",
  openGraph: {
    siteName: "티오(TO) · 대범한사람들",
    locale: "ko_KR",
    type: "website",
    url: TO_URL,
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#111111" };

export default function ToSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 기본 글꼴은 Apple SD Gothic Neo. Mac/iOS가 아닌 환경에서 깨지지 않도록 Noto Sans KR을 대체 글꼴로 불러옵니다. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap" />
      </head>
      <body className="to-body">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
