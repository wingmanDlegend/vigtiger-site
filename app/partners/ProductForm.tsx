"use client";

import { useState, useTransition } from "react";
import { STATUS_LABEL, type ProductDraft, type ProductStatus } from "@/lib/partners/model";
import ImageField from "./ImageField";

type Result = { ok: boolean; message: string; errors?: string[] } | void;
type Extra = { brand_id: string; serial: string; status: ProductStatus; sort: string };

const EMPTY: ProductDraft = { name: "", feature: "", section: "", sponsor: true, rental: true, product_url: "", image_url: "", note: "" };

export default function ProductForm({
  initial,
  submit,
  sections = [],
  submitLabel,
  cancelHref,
  admin,
}: {
  initial?: ProductDraft;
  submit: (raw: Record<string, unknown>) => Promise<Result>;
  sections?: string[];
  submitLabel: string;
  cancelHref: string;
  /** 관리자 화면에서만: 브랜드·일련번호·상태·정렬 */
  admin?: { extra: Extra; brands: { id: string; label: string }[]; serialHint?: string };
}) {
  const [v, setV] = useState<ProductDraft>(initial ?? EMPTY);
  const [x, setX] = useState<Extra | undefined>(admin?.extra);
  const [msg, setMsg] = useState<{ ok: boolean; message: string; errors?: string[] } | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof ProductDraft>(k: K, val: ProductDraft[K]) => setV((p) => ({ ...p, [k]: val }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.name.trim()) {
      setMsg({ ok: false, message: "제품명을 입력해 주세요." });
      return;
    }
    setMsg(null);
    start(async () => {
      const r = await submit({ ...v, ...(x ?? {}) });
      if (r) setMsg(r);
    });
  }

  return (
    <form onSubmit={onSubmit} className="p-pform" noValidate>
      {admin && x && (
        <section className="a-card a-sec">
          <h2>관리 항목</h2>
          <div className="gb-grid">
            <div className="gb-field">
              <label className="a-label" htmlFor="pf-brand">브랜드</label>
              <select id="pf-brand" className="a-select" value={x.brand_id} onChange={(e) => setX({ ...x, brand_id: e.target.value })}>
                {admin.brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor="pf-serial">티오 일련번호</label>
              <input id="pf-serial" className="a-input" value={x.serial} maxLength={20} placeholder={admin.serialHint ?? "비우면 승인할 때 자동"} onChange={(e) => setX({ ...x, serial: e.target.value.toUpperCase() })} />
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor="pf-status">상태</label>
              <select id="pf-status" className="a-select" value={x.status} onChange={(e) => setX({ ...x, status: e.target.value as ProductStatus })}>
                {(Object.keys(STATUS_LABEL) as ProductStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor="pf-sort">순서</label>
              <input id="pf-sort" className="a-input" inputMode="numeric" value={x.sort} onChange={(e) => setX({ ...x, sort: e.target.value.replace(/[^\d]/g, "") })} />
            </div>
          </div>
        </section>
      )}

      <section className="a-card a-sec">
        <h2>제품 정보</h2>
        <div className="p-pgrid">
          <div className="p-pfields">
            <div className="gb-field">
              <label className="a-label" htmlFor="pf-name">제품명 <span className="gb-req">*</span></label>
              <input id="pf-name" className="a-input p-wide" value={v.name} maxLength={120} required onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor="pf-feature">특징</label>
              <textarea id="pf-feature" className="a-textarea p-short" value={v.feature} maxLength={500} onChange={(e) => set("feature", e.target.value)} placeholder="리스트에 3줄 정도로 보여요. 핵심만 짧게 써 주세요." />
              <span className="a-sub p-count">{v.feature.length}/500 · 리스트에는 약 70자까지 잘 보여요</span>
            </div>
            <div className="p-two">
              <div className="gb-field">
                <label className="a-label" htmlFor="pf-section">분류</label>
                <input id="pf-section" className="a-input p-wide" list="pf-sections" value={v.section} maxLength={40} onChange={(e) => set("section", e.target.value)} placeholder="예: 생활가전, 주방용품" />
                <datalist id="pf-sections">
                  {sections.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className="gb-field">
                <label className="a-label" htmlFor="pf-note">비고</label>
                <input id="pf-note" className="a-input p-wide" value={v.note} maxLength={60} onChange={(e) => set("note", e.target.value)} placeholder="예: 4월 출시, 보수중" />
              </div>
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor="pf-url">상품 링크 (보러가기)</label>
              <input id="pf-url" className="a-input p-wide" type="url" value={v.product_url} onChange={(e) => set("product_url", e.target.value)} placeholder="https://smartstore.naver.com/…" />
            </div>
            <fieldset className="p-avail">
              <legend className="a-label">진행 가능 여부</legend>
              <label className="gb-check"><input type="checkbox" checked={v.sponsor} onChange={(e) => set("sponsor", e.target.checked)} /> 협찬 가능</label>
              <label className="gb-check"><input type="checkbox" checked={v.rental} onChange={(e) => set("rental", e.target.checked)} /> 대여 가능</label>
            </fieldset>
          </div>
          <ImageField id="pf-image" label="제품 이미지" value={v.image_url} onChange={(u) => set("image_url", u)} />
        </div>
      </section>

      <div className="gb-actions">
        <button type="submit" className="a-btn" disabled={pending}>{pending ? "저장 중…" : submitLabel}</button>
        <a className="a-btn is-ghost" href={cancelHref}>취소</a>
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
