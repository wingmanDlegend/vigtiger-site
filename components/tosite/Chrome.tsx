import { ArrowRight } from "@/components/Icons";
import { CONTACT } from "@/lib/dictionary";
import { TO_NAV, WWW_URL, type ToNavKey } from "@/lib/tosite/site";

// to.vigtiger.com 머리·바닥 — 메뉴: TO 서비스 소개 / TO 제품 리스트 / 상담신청 / 회사소개
// (주의) 이 사이트 안의 링크는 to.vigtiger.com 기준 경로, 홈페이지로 가는 링크는 절대 주소로 씁니다.
export function ToHeader({ current }: { current?: ToNavKey }) {
  return (
    <header className="header to-header">
      <div className="container header-inner">
        <a href="/" className="logo" aria-label="티오(TO) 홈">
          <span className="logo-mark to-logo-mark" aria-hidden="true">
            TO
          </span>
          <span className="logo-text">
            <b>티오 TO</b>
            <small>by 대범한사람들</small>
          </span>
        </a>
        <nav className="nav" aria-label="메뉴">
          {TO_NAV.map((l) =>
            l.key === "apply" ? (
              <a key={l.key} className="nav-cta to-nav-cta" href={l.href} aria-current={current === l.key ? "page" : undefined}>
                {l.label}
              </a>
            ) : (
              <a key={l.key} className="nav-section" href={l.href} aria-current={current === l.key ? "page" : undefined}>
                {l.label}
              </a>
            ),
          )}
          <details className="nav-mobile">
            <summary>메뉴</summary>
            <ul>
              {TO_NAV.map((l) => (
                <li key={l.key}>
                  <a href={l.href} aria-current={current === l.key ? "page" : undefined}>
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={WWW_URL}>대범한사람들 홈페이지 ↗</a>
              </li>
            </ul>
          </details>
        </nav>
      </div>
    </header>
  );
}

export function ToFooter() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-info">
          <b>(주)대범한사람들 · 티오(TO)</b>
          <span>대표 심성화 · 서울특별시 강남구 논현로115길 71, 604호</span>
          <span>
            {CONTACT.phone} · {CONTACT.email}
          </span>
        </div>
        <nav className="footer-nav" aria-label="하단 메뉴">
          {TO_NAV.map((l) => (
            <a key={l.key} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href={CONTACT.kakao} target="_blank" rel="noopener noreferrer">
            카카오톡 문의
          </a>
          <a href={WWW_URL}>대범한사람들 홈페이지</a>
        </nav>
        <p className="footer-copy">
          <a href={`${WWW_URL}/privacy`} style={{ color: "#ffffff", fontWeight: 700, marginRight: 16 }}>
            개인정보처리방침
          </a>
          © VIGTIGER Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/** 페이지 아래 신청 유도 띠 */
export function ToCta() {
  return (
    <section className="to-cta">
      <div className="container to-cta-inner">
        <div>
          <p className="eyebrow">TRY IT FIRST</p>
          <h2>
            써보고 싶은 제품이 있나요?
            <br />
            브랜드 두 곳만 골라 신청하세요.
          </h2>
        </div>
        <div className="hero-ctas">
          <a className="btn btn-accent" href="/apply">
            상담신청
            <ArrowRight size={18} />
          </a>
          <a className="btn to-btn-ghost" href="/products">
            제품 먼저 보기
          </a>
        </div>
      </div>
    </section>
  );
}
