"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type BrandProfile, type Highlight } from "@/lib/partners/model";

/** 관리자 화면에서만 쓰는 기본 항목 */
export type BrandBasics = { name_ko: string; code: string; category: string; sort: string; active: boolean };
import ImageField from "./ImageField";

type Result = { ok: boolean; message: string; errors?: string[] };

export default function BrandProfileForm({
  initial,
  submit,
  submitLabel,
  cancel,
  basics: initialBasics,
}: {
  initial: BrandProfile;
  basics?: BrandBasics;
  submit: (raw: Record<string, unknown>) => Promise<Result>;
  submitLabel: string;
  cancel?: { label: string; action: () => Promise<Result> };
}) {
  const hl: Highlight[] = [0, 1].map((i) => initial.highlights[i] ?? { title: "", sub: "" });
  const [v, setV] = useState<BrandProfile>({ ...initial, highlights: hl });
  const [bx, setBx] = useState<BrandBasics | undefined>(initialBasics);
  const [msg, setMsg] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const setH = (i: number, k: keyof Highlight, val: string) =>
    setV((p) => ({ ...p, highlights: p.highlights.map((h, j) => (j === i ? { ...h, [k]: val } : h)) }));

  return (
    <form
      className="p-pform"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await submit({ ...(v as unknown as Record<string, unknown>), ...(bx ?? {}) });
          setMsg(r);
          router.refresh();
        });
      }}
    >
      {bx && (
        <section className="a-card a-sec">
          <h2>기본 정보</h2>
          <div className="gb-grid">
            <div className="gb-field">
              <label className="a-label" htmlFor="bb-name">브랜드 이름 <span className="gb-req">*</span></label>
              <input id="bb-name" className="a-input" value={bx.name_ko} maxLength={60} onChange={(e) => setBx({ ...bx, name_ko: e.target.value })} />
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor="bb-code">브랜드 코드 <span className="gb-req">*</span></label>
              <input id="bb-code" className="a-input" value={bx.code} maxLength={8} placeholder="예: OA" onChange={(e) => setBx({ ...bx, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} aria-describedby="bb-code-hint" />
              <span id="bb-code-hint" className="a-sub">티오 일련번호 앞부분 (OA-1, OA-2 …)</span>
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor="bb-cat">분류 <span className="gb-req">*</span></label>
              <select id="bb-cat" className="a-select" value={bx.category} onChange={(e) => setBx({ ...bx, category: e.target.value })}>
                <option value="">골라 주세요</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.no}. {c.label}</option>
                ))}
              </select>
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor="bb-sort">리스트 순서</label>
              <input id="bb-sort" className="a-input" inputMode="numeric" value={bx.sort} onChange={(e) => setBx({ ...bx, sort: e.target.value.replace(/[^\d]/g, "") })} />
            </div>
            <label className="gb-check gb-field">
              <input type="checkbox" checked={bx.active} onChange={(e) => setBx({ ...bx, active: e.target.checked })} /> 리스트에 노출 (끄면 to.vigtiger.com·제품 리스트·인쇄에서 빠져요. 담당자는 계속 제품을 등록·수정 요청할 수 있어요)
            </label>
          </div>
        </section>
      )}
      <section className="a-card a-sec">
        <h2>브랜드 소개</h2>
        <div className="gb-field">
          <label className="a-label" htmlFor="bp-en">영문 이름</label>
          <input id="bp-en" className="a-input p-wide" value={v.name_en} maxLength={80} onChange={(e) => setV({ ...v, name_en: e.target.value })} />
        </div>
        {v.highlights.map((h, i) => (
          <fieldset className="p-hl" key={i}>
            <legend className="a-label">강점 {i + 1}</legend>
            <input className="a-input p-wide" aria-label={`강점 ${i + 1} 제목`} placeholder="예: 네이버 스토어 인기 1위 제품 다수 보유" value={h.title} maxLength={80} onChange={(e) => setH(i, "title", e.target.value)} />
            <input className="a-input p-wide" aria-label={`강점 ${i + 1} 설명`} placeholder="한 줄 설명" value={h.sub} maxLength={120} onChange={(e) => setH(i, "sub", e.target.value)} />
          </fieldset>
        ))}
        <div className="gb-field">
          <label className="a-label" htmlFor="bp-desc">브랜드 소개 글</label>
          <textarea id="bp-desc" className="a-textarea" value={v.description} maxLength={2000} onChange={(e) => setV({ ...v, description: e.target.value })} />
          <span className="a-sub p-count">{v.description.length}/2000 · 리스트에는 4~5줄(약 300자)이 가장 보기 좋아요</span>
        </div>
        <div className="gb-field">
          <label className="a-label" htmlFor="bp-notice">꼭 알아두세요 (대여·협찬 조건)</label>
          <textarea id="bp-notice" className="a-textarea p-short" value={v.notice} maxLength={1000} onChange={(e) => setV({ ...v, notice: e.target.value })} placeholder="예: 대여 신청시 제품 특성상 샘플 제공 방식으로 진행됩니다." />
        </div>
        <ImageField id="bp-hero" label="대표 이미지" folder="brands" wide value={v.hero_url} onChange={(u) => setV({ ...v, hero_url: u })} hint="리스트 브랜드 첫 장 오른쪽에 크게 들어가요. 세로로 긴 사진이 잘 어울려요." />
      </section>
      <div className="gb-actions">
        <button type="submit" className="a-btn" disabled={pending}>{pending ? "저장 중…" : submitLabel}</button>
        {cancel && (
          <button
            type="button"
            className="a-btn is-ghost"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await cancel.action();
                setMsg(r);
                router.refresh();
              })
            }
          >
            {cancel.label}
          </button>
        )}
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
