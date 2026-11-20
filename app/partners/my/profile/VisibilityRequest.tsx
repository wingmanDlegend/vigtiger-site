"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelVisibilityRequestAction, requestVisibilityAction } from "../actions";

const GUIDE = "노출 여부는 브랜드에서 신청하는 것이기 때문에, 신청하면 담당자가 확인 후 진행하겠습니다.";

// 브랜드 정보 > TO 서비스 노출: 지금 상태에 따라 '노출 신청' 또는 '노출 중지 신청'
export default function VisibilityRequest({
  active,
  request,
  requestedAt,
  rejectReason,
}: {
  active: boolean;
  request: "show" | "hide" | null;
  requestedAt: string | null;
  rejectReason: string | null;
}) {
  const [asking, setAsking] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      setMsg(r);
      setAsking(false);
      router.refresh();
    });
  const label = active ? "노출 중지 신청" : "노출 신청";

  return (
    <section className="a-card a-sec p-visreq" aria-labelledby="visreq-title">
      <h2 id="visreq-title">TO 서비스 노출</h2>
      <p className="p-visreq-state">
        지금 상태: <b className={active ? "is-on" : "is-off"}>{active ? "노출 중" : "노출 안 함"}</b>
        <span className="a-sub">
          {active
            ? " — 크리에이터용 TO 제품 리스트(to.vigtiger.com·인쇄)에 우리 브랜드가 보여요."
            : " — 아직 크리에이터용 TO 제품 리스트(to.vigtiger.com·인쇄)에 보이지 않아요."}
        </span>
      </p>

      {request ? (
        <div className="a-note" role="status">
          {requestedAt ? `${new Date(requestedAt).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}에 ` : ""}
          <b>{request === "show" ? "노출 신청" : "노출 중지 신청"}</b>을 했어요. 담당자가 확인 후 진행하겠습니다.
          <div className="a-row" style={{ marginTop: 8 }}>
            <button type="button" className="a-btn is-ghost p-sm" disabled={pending} onClick={() => run(cancelVisibilityRequestAction)}>
              신청 취소
            </button>
          </div>
        </div>
      ) : asking ? (
        <div className="p-visreq-confirm" role="group" aria-label={`${label} 확인`}>
          <p>
            <b>{label}</b>을 할까요? {GUIDE}
          </p>
          <div className="a-row">
            <button type="button" className={`a-btn ${active ? "is-danger" : ""}`} disabled={pending} onClick={() => run(requestVisibilityAction)}>
              {pending ? "신청 중…" : `네, ${label}`}
            </button>
            <button type="button" className="a-btn is-ghost" onClick={() => setAsking(false)}>
              아니요
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="a-row">
            <button type="button" className={`a-btn ${active ? "is-danger-ghost" : ""}`} onClick={() => setAsking(true)}>
              {label}
            </button>
          </div>
          <p className="a-sub">{GUIDE}</p>
          {active && <p className="a-sub">제품 하나만 숨기려면 &lsquo;제품 관리&rsquo;에서 그 제품의 TO 노출 스위치를 끄면 돼요 (바로 반영).</p>}
        </>
      )}
      {rejectReason && !request && <p className="a-error" role="note">지난 신청은 진행되지 않았어요: {rejectReason}</p>}
      {msg && <p className={msg.ok ? "a-saved" : "a-error"} role="status">{msg.message}</p>}
    </section>
  );
}
