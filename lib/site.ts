// 사이트의 대표 주소 (canonical, sitemap, Open Graph 에 사용)
// - 운영(Production) 배포: https://vigtiger.com
// - 미리보기 배포·로컬: 해당 배포 주소
// 다른 주소로 바꾸려면 Vercel 환경변수 NEXT_PUBLIC_SITE_URL 을 지정하세요.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? "https://vigtiger.com"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
