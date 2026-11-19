"use client";

export default function PrintBar({
  admin,
  brands,
  current,
  count,
}: {
  admin: boolean;
  brands: { id: string; name: string }[];
  current: { brand: string; category: string };
  count: { brands: number; products: number };
}) {
  return (
    <div className="cat-bar">
      <div>
        <h1 className="a-h1">티오 제품 리스트</h1>
        <p className="a-sub">
          승인된(게시 중) 제품만 들어가요 · 브랜드 {count.brands}곳, 제품 {count.products}개. 인쇄 창에서 &lsquo;PDF로 저장&rsquo;을 고르면 파일로 받을 수 있어요. (A4 세로, 배경 그래픽 켜기 권장)
        </p>
      </div>
      <div className="a-row">
        {admin && (
          <form method="get" className="a-filter">
            <select className="a-select" name="brand" defaultValue={current.brand} aria-label="브랜드 고르기" onChange={(e) => e.currentTarget.form?.submit()}>
              <option value="">전체 브랜드</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <noscript><button className="a-btn is-ghost" type="submit">보기</button></noscript>
          </form>
        )}
        <button type="button" className="a-btn" onClick={() => window.print()}>인쇄 / PDF 저장</button>
      </div>
    </div>
  );
}
