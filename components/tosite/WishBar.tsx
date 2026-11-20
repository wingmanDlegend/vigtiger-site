"use client";

import { useWish } from "./wish";

// 찜한 제품이 있으면 화면 아래에 떠 있는 바로가기
export default function WishBar() {
  const { ids, ready } = useWish();
  if (!ready || ids.length === 0) return null;
  return (
    <a className="to-wishbar" href="/apply?from=wish">
      <span className="to-wishbar-heart" aria-hidden="true">♥</span>
      찜한 제품 <b>{ids.length}</b>개
      <span className="to-wishbar-cta">· 상담신청하기 →</span>
    </a>
  );
}
