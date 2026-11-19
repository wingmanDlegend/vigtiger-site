import { countWhere } from "@/lib/partners/db";
import type { Session } from "@/lib/partners/auth";
import { logoutAction } from "./actions";

export type PNavKey =
  | "a-home" | "a-review" | "a-products" | "a-brands" | "a-accounts" | "a-log"
  | "b-home" | "b-new" | "b-profile" | "catalog" | "password";

type Item = { key: PNavKey; label: string; href: string };

const ADMIN: { group?: string; items: Item[] }[] = [
  { items: [{ key: "a-home", label: "홈", href: "/admin" }] },
  {
    group: "제품 관리",
    items: [
      { key: "a-review", label: "승인 대기", href: "/admin/review" },
      { key: "a-products", label: "전체 제품", href: "/admin/products" },
      { key: "catalog", label: "제품 리스트 출력", href: "/catalog" },
    ],
  },
  {
    group: "파트너",
    items: [
      { key: "a-brands", label: "브랜드·계정", href: "/admin/brands" },
      { key: "a-accounts", label: "관리자 계정", href: "/admin/accounts" },
      { key: "a-log", label: "작업 기록", href: "/admin/log" },
    ],
  },
];

const BRAND: { group?: string; items: Item[] }[] = [
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

export default async function PTop({ s, current, brandName }: { s: Session; current: PNavKey; brandName?: string }) {
  let reviewCount = 0;
  if (s.role === "admin") {
    try {
      const [a, b] = await Promise.all([
        countWhere("to_products", "or=(status.eq.pending,pending_changes.not.is.null,delete_requested.is.true)"),
        countWhere("partner_brands", "pending_changes=not.is.null"),
      ]);
      reviewCount = a + b;
    } catch {
      reviewCount = 0;
    }
  }
  const nav = s.role === "admin" ? ADMIN : BRAND;
  return (
    <>
      <header className="a-top">
        <div className="a-top-in">
          <a href="/" className="a-brand">
            <span className="a-mark" aria-hidden="true">TO</span>
            TO 파트너스 <small>{s.role === "admin" ? "관리자" : brandName ?? "브랜드"}</small>
          </a>
          <nav className="a-top-links" aria-label="계정">
            <span className="p-who">
              {s.name}
              {s.email ? <small> · {s.email}</small> : null}
            </span>
            {s.role === "admin" && s.kind === "user" && <a href="/password">비밀번호 변경</a>}
            <form action={logoutAction}>
              <button type="submit">로그아웃</button>
            </form>
          </nav>
        </div>
      </header>
      <aside className="a-side">
        <nav aria-label="메뉴">
          {nav.map((g, i) => (
            <div className="a-side-group" key={g.group ?? i}>
              {g.group && <p className="a-side-label">{g.group}</p>}
              <ul>
                {g.items.map((it) => (
                  <li key={it.key}>
                    <a href={it.href} aria-current={current === it.key ? "page" : undefined}>
                      <span>{it.label}</span>
                      {it.key === "a-review" && reviewCount > 0 ? (
                        <b className="a-side-badge" title={`승인 대기 ${reviewCount}건`}>
                          {reviewCount > 99 ? "99+" : reviewCount}
                          <span className="sr-only">건 승인 대기</span>
                        </b>
                      ) : null}
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

export function PHead({ crumb, title, desc, actions }: { crumb?: string; title: string; desc?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="a-head">
      {crumb && <p className="a-crumb">{crumb}</p>}
      <div className="a-head-row">
        <h1 className="a-h1">{title}</h1>
        {actions}
      </div>
      {desc && <p className="a-sub">{desc}</p>}
    </div>
  );
}
