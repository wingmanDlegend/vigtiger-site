export default function NotFound() {
  return (
    <main className="a-login">
      <div className="a-card a-login-box">
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>페이지를 찾을 수 없어요</h1>
        <p className="a-sub">주소가 바뀌었거나 삭제된 항목일 수 있어요.</p>
        <a className="a-btn" href="/">처음으로</a>
      </div>
    </main>
  );
}
