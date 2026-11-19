"use client";

import { useState, useTransition } from "react";
import { adminDeleteBrandAction } from "../../actions";

export default function BrandDanger({ id, name }: { id: string; name: string }) {
  const [asking, setAsking] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  return (
    <section className="a-card a-sec a-danger">
      <h2>브랜드 삭제</h2>
      <p className="a-sub">협업이 끝났다면 위 기본 정보에서 '사용 중'을 끄는 걸 권해요. 삭제는 계정과 제품이 하나도 없을 때만 할 수 있어요.</p>
      {!asking ? (
        <button type="button" className="a-btn is-danger-ghost" onClick={() => setAsking(true)}>브랜드 삭제</button>
      ) : (
        <>
          <p className="a-confirm"><b>{name}</b> 브랜드를 영구 삭제할까요?</p>
          <div className="a-row">
            <button
              type="button"
              className="a-btn is-danger"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await adminDeleteBrandAction(id);
                  if (r && !r.ok) setMsg(r.message);
                  setAsking(false);
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
