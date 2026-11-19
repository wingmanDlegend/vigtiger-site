import { logout } from "./actions";

export default function AdminTop({ current = "applications" }: { current?: "dashboard" | "applications" | "insights" | "groupbuys" }) {
  return (
    <header className="a-top">
      <div className="a-top-in">
        <a href="/admin/dashboard" className="a-brand">
          <span className="a-mark" aria-hidden="true">V</span>
          관리자 <small>대범한사람들</small>
        </a>
        <nav className="a-top-tabs" aria-label="관리 영역">
          <a href="/admin/dashboard" aria-current={current === "dashboard" ? "page" : undefined}>대시보드</a>
          <a href="/admin/dashboard/applications" aria-current={current === "applications" ? "page" : undefined}>신청 접수</a>
          <a href="/admin/insights" aria-current={current === "insights" ? "page" : undefined}>인사이트</a>
          <a href="/admin/dashboard/groupbuys" aria-current={current === "groupbuys" ? "page" : undefined}>공동구매</a>
        </nav>
        <nav className="a-top-links" aria-label="관리자 메뉴">
          <a href="/" target="_blank" rel="noopener noreferrer">홈페이지 보기</a>
          <form action={logout}>
            <button type="submit">로그아웃</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
