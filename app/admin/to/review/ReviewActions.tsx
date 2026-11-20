"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveBrandAction, approveProductAction, approveVisibilityAction, rejectBrandAction, rejectProductAction, rejectVisibilityAction } from "../actions";

export default function ReviewActions({ id, target, approveLabel }: { id: string; target: "product" | "brand" | "visibility"; approveLabel: string }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      // 처리된 카드는 목록에서 사라지므로 결과는 페이지 위쪽에 보여 줌
      if (r.ok) router.push(`/to/review?done=${encodeURIComponent(r.message)}`);
      else setMsg(r);
    });

  return (
    <div className="p-review-actions">
      {!rejecting ? (
        <>
          <button type="button" className="a-btn" disabled={pending} onClick={() => run(() => (target === "product" ? approveProductAction(id) : target === "visibility" ? approveVisibilityAction(id) : approveBrandAction(id)))}>
            {pending ? "처리 중…" : approveLabel}
          </button>
          <button type="button" className="a-btn is-ghost" disabled={pending} onClick={() => setRejecting(true)}>반려</button>
        </>
      ) : (
        <div className="p-reject">
          <label className="a-label" htmlFor={`rj-${id}`}>반려 사유 (브랜드 담당자에게 보여요)</label>
          <textarea
            id={`rj-${id}`}
            className="a-textarea p-short"
            value={reason}
            maxLength={300}
            onChange={(e) => setReason(e.target.value)}
            placeholder="예: 제품 사진이 흐려요. 흰 배경 정사각형 사진으로 다시 올려 주세요."
            autoFocus
          />
          <div className="a-row">
            <button type="button" className="a-btn is-danger" disabled={pending} onClick={() => run(() => (target === "product" ? rejectProductAction(id, reason) : target === "visibility" ? rejectVisibilityAction(id, reason) : rejectBrandAction(id, reason)))}>
              반려하기
            </button>
            <button type="button" className="a-btn is-ghost" onClick={() => setRejecting(false)}>취소</button>
          </div>
        </div>
      )}
      {msg && <p className={msg.ok ? "a-saved" : "a-error"} role="status">{msg.message}</p>}
    </div>
  );
}
