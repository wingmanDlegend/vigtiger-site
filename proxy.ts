import { NextResponse, type NextRequest } from "next/server";

// 한 앱을 도메인별로 나눠 보여 줍니다.
// - www.vigtiger.com        홈페이지 (app/[lang])
// - partners.vigtiger.com   브랜드 비즈니스 파트너 (app/partners)
// - admin.vigtiger.com      대범한사람들 업무 관리 (app/admin)
// 주소창은 그대로 두고 내부 경로만 바꿉니다. 로컬 확인용으로 *.localhost 도 같은 규칙.
const PARTNERS = /^partners\.(vigtiger\.com|localhost)$/;
const ADMIN = /^admin\.(vigtiger\.com|localhost)$/;
const MAIN = /^(www\.)?vigtiger\.(com|co\.kr)$/;

function rewrite(req: NextRequest, base: string, home: string) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/partners-seed/")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? home : `${base}${pathname}`;
  return NextResponse.rewrite(url);
}

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname, search } = req.nextUrl;

  if (ADMIN.test(host)) return rewrite(req, "/admin", "/admin/dashboard");
  if (PARTNERS.test(host)) return rewrite(req, "/partners", "/partners");

  // 메인 도메인에서 예전 관리자 주소·파트너 주소로 들어오면 전용 도메인으로
  if (MAIN.test(host)) {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const rest = pathname.replace(/^\/admin/, "");
      // 예전 신청 상세 주소(/admin/<id>) → /applications/<id>
      const mapped = /^\/[0-9a-f-]{36}$/i.test(rest) ? `/applications${rest}` : rest === "" && search ? "/applications" : rest || "/";
      return NextResponse.redirect(`https://admin.vigtiger.com${mapped}${search}`);
    }
    if (pathname === "/partners" || pathname.startsWith("/partners/")) {
      return NextResponse.redirect(`https://partners.vigtiger.com${pathname.replace(/^\/partners/, "") || "/"}${search}`);
    }
  }
  return NextResponse.next();
}

export const config = {
  // 정적 파일·이미지는 건너뜀
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml|.*\\.(?:webp|png|jpg|jpeg|svg|ico|css|js|woff2?)$).*)"],
};
