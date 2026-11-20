"use client";

import { toggleWish, useWish } from "./wish";

// 제품 카드의 찜하기(하트) 버튼
export default function WishButton({ id, name }: { id: string; name: string }) {
  const { ids } = useWish();
  const on = ids.includes(id);
  return (
    <button
      type="button"
      className={`tp-wish${on ? " is-on" : ""}`}
      aria-pressed={on}
      aria-label={on ? `${name} 찜 해제` : `${name} 찜하기`}
      title={on ? "찜 해제" : "찜하기"}
      onClick={() => toggleWish(id)}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.1 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.5 0 5.6 3.6 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
