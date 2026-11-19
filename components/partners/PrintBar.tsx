"use client";

// 인쇄/PDF 보기 화면 위쪽 막대 (인쇄할 때는 숨겨짐)
export default function PrintBar({ backHref, count, scope }: { backHref: string; count: { brands: number; products: number }; scope: string }) {
  return (
    <div className="cat-bar">
      <div>
        <a className="a-back" href={backHref}>← 제품 리스트로</a>
        <h1 className="a-h1">인쇄 / PDF 보기</h1>
        <p className="a-sub">
          {scope} · 브랜드 {count.brands}곳, 제품 {count.products}개 (게시 중 제품만). 인쇄 창에서 대상을 &lsquo;PDF로 저장&rsquo;으로 고르면 파일로 받을 수 있어요. A4 세로, &lsquo;배경 그래픽&rsquo;을 켜면 색이 그대로 나와요.
        </p>
      </div>
      <div className="a-row">
        <button type="button" className="a-btn" onClick={() => window.print()}>인쇄 / PDF 저장</button>
      </div>
    </div>
  );
}
