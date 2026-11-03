"use client";

import { useState, useTransition } from "react";
import { removeApplication } from "../actions";

// 2단계 확인: [삭제] → "정말 삭제할까요?" [영구 삭제] [취소]
export default function DeleteBox({ id, type, name }: { id: string; type: string; name: string }) {
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function remove() {
    setError("");
    startTransition(async () => {
      const r = await removeApplication(id, type); // 성공하면 목록으로 이동합니다
      if (r && !r.ok) setError(r.message);
    });
  }

  return (
    <section className="a-card a-sec a-danger">
      <h2>신청 삭제</h2>
      {!asking ? (
        <>
          <p className="a-sub">테스트·중복·스팸 신청을 지울 때 사용하세요. 삭제하면 되돌릴 수 없습니다.</p>
          <button type="button" className="a-btn is-danger-ghost" onClick={() => setAsking(true)}>
            이 신청 삭제
          </button>
        </>
      ) : (
        <>
          <p className="a-confirm">
            <b>{name}</b> 님의 신청을 영구 삭제할까요?
            <br />
            삭제 후에는 복구할 수 없습니다.
          </p>
          <div className="a-row">
            <button type="button" className="a-btn is-danger" onClick={remove} disabled={pending}>
              {pending ? "삭제 중…" : "영구 삭제"}
            </button>
            <button type="button" className="a-btn is-ghost" onClick={() => setAsking(false)} disabled={pending}>
              취소
            </button>
          </div>
        </>
      )}
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
