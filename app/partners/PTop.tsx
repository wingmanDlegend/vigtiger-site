import type { Session } from "@/lib/partners/auth";
import { brandLogoutAction } from "@/components/partners/actions";

// partners.vigtiger.com — 브랜드 담당자 전용 머리·메뉴 (관리 기능은 admin.vigtiger.com)
export type PNavKey = "b-home" | "b-new" | "b-profile" | "catalog" | "password";

const NAV: { group?: string; items: { key: PNavKey; label: string; href: string }[] }[] = [
  {
    items: [
      { key: "b-home", label: "내 제품", href: "/my" },
      { key: "b-new", label: "제품 등록", href: "/my/new" },
      { key: "b-profile", label: "브랜드 정보", href: "/my/profile" },
      { key: "catalog", label: "제품 리스트 출력", href: "/catalog" },
    ],
  },
  { group: "계정", items: [{ key: "password", label: "비밀번호 변경", href: "/password" }] },
];

export default function PTop({ s, current, brandName }: { s: Session; current: PNavKey; brandName?: string }) {
  return (
    <>
      <header className="a-top">
        <div className="a-top-in">
          <a href="/my" className="a-brand">
            <span className="a-mark" aria-hidden="true">TO</span>
            TO 파트너스 <small>{brandName ?? "브랜드"}</small>
          </a>
          <nav className="a-top-links" aria-label="계정">
            <span className="p-who">
              {s.name}
              {s.email ? <small> · {s.email}</small> : null}
            </span>
            <form action={brandLogoutAction}>
              <button type="submit">로그아웃</button>
            </form>
          </nav>
        </div>
      </header>
      <aside className="a-side">
        <nav aria-label="메뉴">
          {NAV.map((g, i) => (
            <div className="a-side-group" key={g.group ?? i}>
              {g.group && <p className="a-side-label">{g.group}</p>}
              <ul>
                {g.items.map((it) => (
                  <li key={it.key}>
                    <a href={it.href} aria-current={current === it.key ? "page" : undefined}>
                      <span>{it.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export { PageHead as PHead } from "@/app/admin/SubNav";
