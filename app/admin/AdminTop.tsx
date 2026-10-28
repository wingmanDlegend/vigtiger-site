import { logout } from "./actions";

export default function AdminTop() {
  return (
    <header className="a-top">
      <div className="a-top-in">
        <a href="/admin" className="a-brand">
          <span className="a-mark" aria-hidden="true">V</span>
          신청 관리 <small>대범한사람들</small>
        </a>
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
