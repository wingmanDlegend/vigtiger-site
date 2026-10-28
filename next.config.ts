import type { NextConfig } from "next";

// 한국어는 접두사 없이(/, /apply/creator), 영어는 /en 아래에서 서비스합니다.
// 실제 페이지는 app/[lang] 아래에 있고, 한국어 주소는 /ko 로 내부 rewrite 됩니다.
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/ko" },
      { source: "/apply/:type", destination: "/ko/apply/:type" },
    ];
  },
  async redirects() {
    return [
      { source: "/ko", destination: "/", permanent: true },
      { source: "/ko/apply/:type", destination: "/apply/:type", permanent: true },
    ];
  },
};

export default nextConfig;
