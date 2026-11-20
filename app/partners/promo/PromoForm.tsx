"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelPromoRequestAction, requestPromoAction, type PromoResult } from "./actions";

type Opt = { id: string; label: string; pick: boolean; hot: boolean };

// 추천·핫딜 신청서 (브랜드)
export default function PromoForm({ products, initialProduct }: { products: Opt[]; initialProduct?: string }) {
  const [kind, setKind] = useState<"pick" | "hot">("pick");
  const [productId, setProductId] = useState(initialProduct ?? "");
  const [hotNote, setHotNote] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState<PromoResult | null>(null);
  const [pending, startT] = useTransition();
  const router = useRouter();
  const sel = products.find((p) => p.id === productId);
  const already = sel && ((kind === "pick" && sel.pick) || (kind === "hot" && sel.hot));

  if (products.length === 0) {
    return <p className="a-card a-empty">게시 중인 제품이 없어요. 제품이 승인되어 게시되면 신청할 수 있어요.</p>;
  }

  return (
    <form
      className="a-card a-sec p-promo-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        startT(async () => {
          const r = await requestPromoAction({ kind, product_id: productId, hot_note: hotNote, start_date: start, end_date: end, message });
          setMsg(r);
          if (r.ok) {
            setHotNote("");
            setStart("");
            setEnd("");
            setMessage("");
            router.refresh();
          }
        });
      }}
    >
      <h2>새로 신청하기</h2>
      <fieldset className="p-avail">
        <legend className="a-label">
          신청 종류 <span className="gb-req">*</span>
        </legend>
        <label className="gb-check">
          <input type="radio" name="kind" value="pick" checked={kind === "pick"} onChange={() => setKind("pick")} /> 이번 주 추천
        </label>
        <label className="gb-check">
          <input type="radio" name="kind" value="hot" checked={kind === "hot"} onChange={() => setKind("hot")} /> 핫딜
        </label>
      </fieldset>
      <p className="a-sub">
        {kind === "pick"
          ? "이번 주 추천: to.vigtiger.com 제품 리스트 맨 위 'MD가 고른 이번 주 제품' 묶음에 보여요."
          : "핫딜: 조건이 특히 좋은 제품을 모아 보여 주는 묶음이에요. 카드에 짧은 문구(예: 공구가 30%)와 마감일이 붙어요."}
      </p>
      <div className="gb-field">
        <label className="a-label" htmlFor="pr-product">
          제품 <span className="gb-req">*</span>
        </label>
        <select id="pr-product" className="a-select p-wide" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">게시 중인 제품 중에서 골라 주세요</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
              {p.pick ? " · 이번 주 추천 중" : ""}
              {p.hot ? " · 핫딜 중" : ""}
            </option>
          ))}
        </select>
        {already && <span className="p-reason">이미 {kind === "pick" ? "이번 주 추천" : "핫딜"}에 올라 있는 제품이에요.</span>}
      </div>
      {kind === "hot" && (
        <div className="gb-field">
          <label className="a-label" htmlFor="pr-note">핫딜 카드 문구</label>
          <input id="pr-note" className="a-input p-wide" value={hotNote} maxLength={60} onChange={(e) => setHotNote(e.target.value)} placeholder="예: 공구가 30% · 1+1 · 사은품 증정" />
        </div>
      )}
      <div className="p-two">
        <div className="gb-field">
          <label className="a-label" htmlFor="pr-start">희망 시작일</label>
          <input id="pr-start" className="a-input" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="gb-field">
          <label className="a-label" htmlFor="pr-end">{kind === "hot" ? "희망 마감일" : "희망 종료일"}</label>
          <input id="pr-end" className="a-input" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <div className="gb-field">
        <label className="a-label" htmlFor="pr-msg">담당자에게 전할 내용</label>
        <textarea
          id="pr-msg"
          className="a-textarea p-short"
          value={message}
          maxLength={1000}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="이번 혜택·조건, 재고, 신청 이유 등을 적어 주시면 검토에 도움이 돼요."
        />
      </div>
      <p className="a-note" role="note">
        추천·핫딜 노출은 브랜드에서 신청하는 것이기 때문에, 신청하면 담당자가 확인 후 진행하겠습니다.
      </p>
      <div className="gb-actions">
        <button type="submit" className="a-btn" disabled={pending || !productId || !!already}>
          {pending ? "신청 중…" : "신청하기"}
        </button>
        {msg && (
          <div className={msg.ok ? "a-saved" : "a-error"} role="status">
            {msg.message}
            {msg.errors && (
              <ul>
                {msg.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

export function CancelPromo({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const router = useRouter();
  return (
    <span className="p-actions">
      <button
        type="button"
        className="a-btn is-ghost p-sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await cancelPromoRequestAction(id);
            setMsg(r.ok ? "" : r.message);
            router.refresh();
          })
        }
      >
        신청 취소
      </button>
      {msg && <span className="a-error">{msg}</span>}
    </span>
  );
}
