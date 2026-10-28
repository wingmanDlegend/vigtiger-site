import Script from "next/script";

// Google Analytics 4
// 측정 ID는 공개값이라 코드에 둡니다. Vercel 환경변수 NEXT_PUBLIC_GA_ID 로 바꿀 수도 있습니다.
// 페이지 이동은 GA4 '향상된 측정'의 "브라우저 기록 이벤트 기반 페이지 변경"으로 자동 집계됩니다.
// G-17F4EG2VG3 은 Google 태그 "대범한사람들홈페이지"의 태그 ID입니다.
// 이 태그에 GA4 속성 두 개(G-17F4EG2VG3, 2026 홈페이지 G-9DKRM93S6V)가 '대상'으로 묶여 있어
// 태그 ID 하나만 불러오면 두 속성 모두에 데이터가 들어갑니다. (대상 ID로는 스크립트가 404)
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-17F4EG2VG3";

export default function Analytics() {
  if (!/^G-[A-Z0-9]{4,}$/.test(GA_ID)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
