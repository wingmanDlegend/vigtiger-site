"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveApplication } from "../actions";

const STATUS_OPTIONS = [
  ["new", "신규"],
  ["in_review", "검토 중"],
  ["contacted", "연락함"],
  ["done", "진행 확정"],
  ["rejected", "보류·종료"],
] as const;

export default function EditForm({ id, status, note, updatedAt }: { id: string; status: string; note: string; updatedAt: string }) {
  const [st, setSt] = useState(status);
  const [memo, setMemo] = useState(note);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);
  const [pending, startTransition] = useTransition();

  // form action 대신 직접 호출: 저장 후 폼이 자동 초기화되어 예전 값으로 돌아가는 것을 막습니다.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setResult(null);
    startTransition(async () => {
      setResult(await saveApplication(id, null, fd));
    });
  }

  return (
    <form onSubmit={onSubmit} className="a-card a-sec">
      <h2>처리 상태 · 내부 메모</h2>
      <label className="a-label" htmlFor="st">처리 상태</label>
      <select id="st" name="status" className="a-select" value={st} onChange={(e) => setSt(e.target.value)}>
        {STATUS_OPTIONS.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <label className="a-label" htmlFor="note">내부 메모</label>
      <textarea
        id="note"
        name="admin_note"
        className="a-textarea"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="통화 내용, 다음 할 일 등 (신청자에게는 보이지 않아요)"
        maxLength={4000}
      />
      <button className="a-btn" type="submit" disabled={pending} style={{ justifyContent: "center" }}>
        {pending ? "저장 중…" : "저장"}
      </button>
      {result && (
        <p className={result.ok ? "a-saved" : "a-error"} role="status">
          {result.message}
        </p>
      )}
      <p className="a-sub">마지막 수정: {updatedAt}</p>
    </form>
  );
}
