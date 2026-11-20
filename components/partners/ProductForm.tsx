"use client";

import { useState, useTransition } from "react";
import { OWN_MALL_LABEL, STATUS_LABEL, discountPct, type OwnMall, type ProductDraft, type ProductStatus } from "@/lib/partners/model";
import ImageField from "./ImageField";

type Result = { ok: boolean; message: string; errors?: string[] } | void;
type Extra = { brand_id: string; serial: string; status: ProductStatus; sort: string; to_visible: boolean };

const EMPTY: ProductDraft = {
  name: "", feature: "", section: "", sponsor: true, rental: true, product_url: "", image_url: "", note: "",
  list_price: null, online_price: null, groupbuy_price: null, commission_rate: null, own_mall_groupbuy: "", gift: "", extra_note: "",
};
const fmtWon = (n: number | null) => (n === null || n === undefined ? "" : n.toLocaleString("ko-KR"));
const toWon = (s: string) => {
  const d = s.replace(/[^\d]/g, "").slice(0, 10);
  return d ? Number(d) : null;
};

export default function ProductForm({
  initial,
  submit,
  sections = [],
  submitLabel,
  cancelHref,
  admin,
  visibility,
}: {
  initial?: ProductDraft;
  submit: (raw: Record<string, unknown>) => Promise<Result>;
  sections?: string[];
  submitLabel: string;
  cancelHref: string;
  /** 관리자 화면에서만: 브랜드·일련번호·상태·정렬 */
  admin?: { extra: Extra; brands: { id: string; label: string }[]; serialHint?: string };
  /** 새 제품 등록(브랜드)에서만: TO 서비스 노출 처음 값 */
  visibility?: boolean;
}) {
  const [v, setV] = useState<ProductDraft>(initial ?? EMPTY);
  const [x, setX] = useState<Extra | undefined>(admin?.extra);
  const [msg, setMsg] = useState<{ ok: boolean; message: string; errors?: string[] } | null>(null);
  const [pending, start] = useTransition();
  const [toVisible, setToVisible] = useState(visibility ?? true);
  const [rate, setRate] = useState(initial?.commission_rate === null || initial?.commission_rate === undefined ? "" : String(initial.commission_rate));
  const set = <K extends keyof ProductDraft>(k: K, val: ProductDraft[K]) => setV((p) => ({ ...p, [k]: val }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.name.trim()) {
      setMsg({ ok: false, message: "제품명을 입력해 주세요." });
      return;
    }
    setMsg(null);
    start(async () => {
      const r = await submit({ ...v, commission_rate: rate, ...(x ?? {}), ...(visibility !== undefined ? { to_visible: toVisible } : {}) });
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
            <label className="gb-check gb-field">
              <input type="checkbox" checked={x.to_visible} onChange={(e) => setX({ ...x, to_visible: e.target.checked })} /> TO 서비스에 노출 (브랜드가 끌 수도 있어요)
            </label>
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

      <section className="a-card a-sec">
        <h2>가격 · 판매 조건</h2>
        <p className="a-sub">대범한사람들 담당자만 보는 정보예요. 크리에이터용 제품 리스트(to.vigtiger.com·인쇄)에는 보이지 않아요. 모르는 칸은 비워 두셔도 돼요.</p>
        <div className="p-price-grid">
          <div className="gb-field">
            <label className="a-label" htmlFor="pf-list">정가</label>
            <span className="p-unit"><input id="pf-list" className="a-input" inputMode="numeric" value={fmtWon(v.list_price)} onChange={(e) => set("list_price", toWon(e.target.value))} placeholder="예: 39,000" /><span>원</span></span>
          </div>
          <div className="gb-field">
            <label className="a-label" htmlFor="pf-online">온라인 판매가</label>
            <span className="p-unit"><input id="pf-online" className="a-input" inputMode="numeric" value={fmtWon(v.online_price)} onChange={(e) => set("online_price", toWon(e.target.value))} placeholder="예: 32,900" /><span>원</span></span>
            {discountPct(v.list_price, v.online_price) !== null && <span className="a-sub">정가 대비 {discountPct(v.list_price, v.online_price)}% 할인</span>}
          </div>
          <div className="gb-field">
            <label className="a-label" htmlFor="pf-gb">공구가</label>
            <span className="p-unit"><input id="pf-gb" className="a-input" inputMode="numeric" value={fmtWon(v.groupbuy_price)} onChange={(e) => set("groupbuy_price", toWon(e.target.value))} placeholder="예: 27,900" /><span>원</span></span>
            {discountPct(v.list_price, v.groupbuy_price) !== null && <span className="a-sub">정가 대비 {discountPct(v.list_price, v.groupbuy_price)}% 할인</span>}
          </div>
          <div className="gb-field">
            <label className="a-label" htmlFor="pf-rate">판매 수수료</label>
            <span className="p-unit"><input id="pf-rate" className="a-input" inputMode="decimal" value={rate} maxLength={6} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))} placeholder="예: 20" /><span>%</span></span>
          </div>
        </div>
        <fieldset className="p-avail">
          <legend className="a-label">자사몰에서 공구 진행</legend>
          {(Object.keys(OWN_MALL_LABEL) as OwnMall[]).map((k) => (
            <label className="gb-check" key={k}>
              <input type="radio" name="pf-ownmall" value={k} checked={v.own_mall_groupbuy === k} onChange={() => set("own_mall_groupbuy", k)} /> {OWN_MALL_LABEL[k]}
            </label>
          ))}
          {v.own_mall_groupbuy && (
            <button type="button" className="p-link" onClick={() => set("own_mall_groupbuy", "")}>선택 지우기</button>
          )}
        </fieldset>
        <div className="gb-field">
          <label className="a-label" htmlFor="pf-gift">사은품 (제공할 때)</label>
          <input id="pf-gift" className="a-input p-wide" value={v.gift} maxLength={200} onChange={(e) => set("gift", e.target.value)} placeholder="예: 공구 구매 시 전용 파우치 증정" />
        </div>
        <div className="gb-field">
          <label className="a-label" htmlFor="pf-extra">기타 사항</label>
          <textarea id="pf-extra" className="a-textarea p-short" value={v.extra_note} maxLength={1000} onChange={(e) => set("extra_note", e.target.value)} placeholder="배송·재고·공구 가능 시기, 조건 등 담당자가 알아야 할 내용" />
        </div>
      </section>

      {visibility !== undefined && (
        <section className="a-card a-sec">
          <h2>TO 서비스 노출</h2>
          <label className="gb-check">
            <input type="checkbox" checked={toVisible} onChange={(e) => setToVisible(e.target.checked)} /> 승인되면 크리에이터용 TO 제품 리스트(to.vigtiger.com)에 보여 주기
          </label>
          <p className="a-sub">나중에 &lsquo;제품 관리&rsquo; 목록에서 언제든 켜고 끌 수 있어요. 켜고 끄는 건 승인 없이 바로 반영돼요.</p>
        </section>
      )}

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
