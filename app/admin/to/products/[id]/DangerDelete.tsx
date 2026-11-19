"use client";

import { useState, useTransition } from "react";
import { adminDeleteProductAction } from "../../actions";

export default function DangerDelete({ id, name }: { id: string; name: string }) {
  const [asking, setAsking] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  return (
    <section className="a-card a-sec a-danger">
      <h2>제품 삭제</h2>
      <p className="a-sub">리스트에서 잠깐 빼려면 상태를 '숨김'으로 바꾸는 게 좋아요. 삭제는 되돌릴 수 없어요.</p>
      {!asking ? (
        <button type="button" className="a-btn is-danger-ghost" onClick={() => setAsking(true)}>이 제품 삭제</button>
      ) : (
        <>
          <p className="a-confirm"><b>{name}</b>을(를) 영구 삭제할까요?</p>
          <div className="a-row">
            <button
              type="button"
              className="a-btn is-danger"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await adminDeleteProductAction(id);
                  if (r && !r.ok) setMsg(r.message);
                })
              }
            >
              영구 삭제
            </button>
            <button type="button" className="a-btn is-ghost" onClick={() => setAsking(false)}>취소</button>
          </div>
        </>
      )}
      {msg && <p className="a-error" role="alert">{msg}</p>}
    </section>
  );
}
