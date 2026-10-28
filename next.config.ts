import type { NextConfig } from "next";

// 한국어는 접두사 없이(/, /about, /services/to …), 영어는 /en 아래에서 서비스합니다.
// 실제 페이지는 app/[lang] 아래에 있고, 한국어 주소는 /ko/… 로 내부 rewrite 됩니다.
const KO_ROUTES = ["/about", "/privacy", "/services/:slug", "/apply/:type"];

// 기존 vigtiger.com(Notion/oopy) 페이지 주소 → 새 페이지
// 도메인을 이 사이트로 옮긴 뒤에도 예전 링크·검색 결과가 끊기지 않도록 합니다.
const LEGACY: Record<string, string> = {
  "afe9bb7a-6725-4461-a124-e7beb3de7033": "/about",
  "5b4430df-ea8a-4479-a9e8-dedbe2a8899e": "/services/advirtual",
  "87379865-ae1b-4756-97b4-f3ebf239a137": "/services/shopping",
  "f23e03c3-b22e-4945-ab78-65a75f728a66": "/services/to",
  "3bd13995-2a0c-4a4a-8727-794bd5619d45": "/apply/creator",
  "8cac3eff-3ad1-49b4-a294-101e4f2b3dd5": "/apply/advertiser",
  "23c5aca8-f3f3-4df9-b097-2cc41a912673": "/apply/partner",
  "1b392241-06fa-808e-8bbc-d53b4a64b96d": "/en",
};

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/ko" },
      ...KO_ROUTES.map((source) => ({ source, destination: `/ko${source}` })),
    ];
  },
  async redirects() {
    return [
      { source: "/ko", destination: "/", permanent: true },
      { source: "/ko/:path*", destination: "/:path*", permanent: true },
      ...Object.entries(LEGACY).map(([id, destination]) => ({
        source: `/${id}`,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
