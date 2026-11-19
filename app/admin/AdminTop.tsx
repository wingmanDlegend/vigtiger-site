import { logout } from "./actions";
import { ADMIN_NAV, navBadges, type NavKey } from "@/lib/admin/nav";

const BADGE_TITLE: Partial<Record<NavKey, string>> = {
  applications: "처리하지 않은 신규 신청",
  groupbuys: "정산 대기",
  trends: "검토 대기 초안",
  hot: "검토 대기 초안",
};

// 관리자 공통 머리(브랜드·홈페이지 보기·로그아웃) + 왼쪽 사이드바 메뉴
export default async function AdminTop({ current }: { current: NavKey }) {
  const badges = await navBadges();
  return (
    <>
      <header className="a-top">
        <div className="a-top-in">
          <a href="/admin/dashboard" className="a-brand">
            <span className="a-mark" aria-hidden="true">V</span>
            관리자 <small>대범한사람들</small>
          </a>
          <nav className="a-top-links" aria-label="계정">
            <a href="/" target="_blank" rel="noopener noreferrer">홈페이지 보기</a>
            <form action={logout}>
              <button type="submit">로그아웃</button>
            </form>
          </nav>
        </div>
      </header>
      <aside className="a-side">
        <nav aria-label="관리자 메뉴">
          {ADMIN_NAV.map((g, i) => (
            <div className="a-side-group" key={g.group ?? i}>
              {g.group && <p className="a-side-label">{g.group}</p>}
              <ul>
                {g.items.map((it) => {
                  const n = badges[it.key];
                  return (
                    <li key={it.key}>
                      <a href={it.href} aria-current={current === it.key ? "page" : undefined}>
                        <span>{it.label}</span>
                        {n ? (
                          <b className="a-side-badge" title={`${BADGE_TITLE[it.key]} ${n}건`}>
                            {n > 99 ? "99+" : n}
                            <span className="sr-only">건 {BADGE_TITLE[it.key]}</span>
                          </b>
                        ) : null}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
