import { NextResponse, type NextRequest } from "next/server";

// partners.vigtiger.com (티오 제품 관리)
// - 이 도메인으로 들어온 요청은 같은 앱의 app/partners 아래 페이지로 연결 (주소창은 그대로)
// - 메인 도메인(vigtiger.com)에서 /partners 로 들어오면 전용 도메인으로 보냄
// 로컬 확인용으로 partners.localhost 도 같은 규칙을 씁니다.
const PARTNERS = /^partners\.(vigtiger\.com|localhost)$/;
const MAIN = /^(www\.)?vigtiger\.com$/;

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname, search } = req.nextUrl;

  if (PARTNERS.test(host)) {
    if (pathname.startsWith("/partners-seed/")) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/partners" : `/partners${pathname}`;
    return NextResponse.rewrite(url);
  }
  if (MAIN.test(host) && (pathname === "/partners" || pathname.startsWith("/partners/"))) {
    return NextResponse.redirect(`https://partners.vigtiger.com${pathname.replace(/^\/partners/, "") || "/"}${search}`);
  }
  return NextResponse.next();
}

export const config = {
  // 정적 파일·이미지는 건너뜀
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml|.*\\.(?:webp|png|jpg|jpeg|svg|ico|css|js|woff2?)$).*)"],
};
