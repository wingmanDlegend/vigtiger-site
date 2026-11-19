"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelRequestAction, deleteProductAction } from "./actions";

export default function RowActions({ id, name, live, hasRequest }: { id: string; name: string; live: boolean; hasRequest: boolean }) {
  const [asking, setAsking] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      setMsg(r.message);
      setAsking(false);
      router.refresh();
    });

  if (asking) {
    return (
      <span className="p-confirm" role="group" aria-label={`${name} 삭제 확인`}>
        <span>{live ? "삭제를 요청할까요?" : "등록 요청을 취소하고 지울까요?"}</span>
        <button type="button" className="a-btn is-danger" disabled={pending} onClick={() => run(() => deleteProductAction(id))}>
          {live ? "삭제 요청" : "지우기"}
        </button>
        <button type="button" className="a-btn is-ghost" onClick={() => setAsking(false)}>아니요</button>
      </span>
    );
  }
  return (
    <span className="p-actions">
      <a className="a-btn is-ghost p-sm" href={`/my/${id}`}>수정</a>
      {hasRequest ? (
        <button type="button" className="a-btn is-ghost p-sm" disabled={pending} onClick={() => run(() => cancelRequestAction(id))}>요청 취소</button>
      ) : (
        <button type="button" className="a-btn is-danger-ghost p-sm" onClick={() => setAsking(true)}>삭제</button>
      )}
      {msg && <span className="a-sub" role="status">{msg}</span>}
    </span>
  );
}
