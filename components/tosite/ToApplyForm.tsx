"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FORMS, LIMITS, type Field } from "@/lib/forms";
import { getDict } from "@/lib/dictionary";
import { submitToApply } from "@/app/tosite/apply/actions";
import { track } from "@/lib/track";
import { Check } from "@/components/Icons";
import { addWish, readWish, removeWish, useWish } from "./wish";

export type FormBrand = { id: string; name: string; category: string; categoryLabel: string };
export type FormProduct = { id: string; brandId: string; label: string; name: string; image: string | null; serial: string | null };

type Status = "idle" | "sending" | "done" | "error";
const t = getDict("ko").apply;
const def = FORMS.to;
const CHANNEL_KEYS = ["channelName", "channelUrl", "subscribers", "category"];

// to.vigtiger.com 상담신청서 — 써보고 싶은 브랜드·제품 1곳 필수, 최대 2곳
// 고르는 방법 두 가지: ① 제품 리스트에서 찜한 제품 중에서 고르기 ② 드롭다운으로 직접 고르기
export default function ToApplyForm({
  brands,
  products,
  initial,
}: {
  brands: FormBrand[];
  products: FormProduct[];
  initial: { brand1?: string; product1?: string; fromWish?: boolean };
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [b1, setB1] = useState(initial.brand1 ?? "");
  const [p1, setP1] = useState(initial.product1 ?? "");
  const [b2, setB2] = useState("");
  const [p2, setP2] = useState("");
  const { ids: wishIds, ready } = useWish();
  const [mode, setMode] = useState<"wish" | "direct">(initial.product1 || initial.fromWish ? "wish" : "direct");
  const [picked, setPicked] = useState<string[]>(initial.product1 ? [initial.product1] : []);
  const pById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const bById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);
  // 카드의 '신청하기'로 들어온 제품은 찜 목록에도 넣어 둠. 찜 목록이 있으면 '찜한 제품' 방식으로 시작
  useEffect(() => {
    if (initial.product1) addWish(initial.product1);
    else if (readWish().some((id) => pById.has(id))) setMode("wish");
  }, [initial.product1, pById]);
  const wished = wishIds.map((id) => pById.get(id)).filter((p): p is FormProduct => !!p);
  const togglePick = (id: string) =>
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 2 ? cur : [...cur, id]));

  const byBrand = useMemo(() => {
    const m = new Map<string, FormProduct[]>();
    for (const p of products) m.set(p.brandId, [...(m.get(p.brandId) ?? []), p]);
    return m;
  }, [products]);
  const groups = useMemo(() => {
    const m = new Map<string, FormBrand[]>();
    for (const b of brands) m.set(b.categoryLabel, [...(m.get(b.categoryLabel) ?? []), b]);
    return [...m.entries()];
  }, [brands]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    // 고른 방법에 따라 칸 1·2를 채움
    let slots: { brand: string; product: string }[];
    if (mode === "wish") {
      slots = picked.map((id) => pById.get(id)).filter((p): p is FormProduct => !!p).map((p) => ({ brand: p.brandId, product: p.id }));
    } else {
      slots = [{ brand: b1, product: p1 }, { brand: b2, product: p2 }].filter((x) => x.brand);
    }
    if (slots.length === 0) {
      setError(mode === "wish" ? "찜한 제품 중에서 1개 이상 골라 주세요. (최대 2개)" : "써보고 싶은 브랜드를 1곳 이상 골라 주세요.");
      setStatus("error");
      return;
    }
    if (slots.length === 2 && slots[0].brand === slots[1].brand && (!slots[0].product || !slots[1].product || slots[0].product === slots[1].product)) {
      setError("같은 브랜드를 두 번 고르려면 서로 다른 제품을 골라 주세요.");
      setStatus("error");
      return;
    }
    const details: Record<string, string | string[]> = {
      brand1: slots[0].brand,
      product1: slots[0].product,
      brand2: slots[1]?.brand ?? "",
      product2: slots[1]?.product ?? "",
    };
    for (const f of def.fields) {
      if (f.key in details) continue;
      details[f.key] = f.kind === "checkboxes" ? (fd.getAll(f.key) as string[]) : String(fd.get(f.key) ?? "");
    }
    setStatus("sending");
    setError("");
    try {
      const res = await submitToApply({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        message: String(fd.get("message") ?? ""),
        privacyAgreed: fd.get("privacy") === "on",
        website: String(fd.get("website") ?? ""),
        details,
      });
      if (!res.ok) {
        setError(res.message ?? (res.error === "invalid" ? t.errorRequired : t.errorServer));
        setStatus("error");
        return;
      }
      setStatus("done");
      // 신청한 제품은 찜 목록에서 정리
      for (const sl of [details.product1, details.product2]) if (typeof sl === "string" && sl) removeWish(sl);
      track("generate_lead", { form_type: "to", form_lang: "ko" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t.errorServer);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <section className="success" aria-live="polite">
        <span className="success-mark">
          <Check />
        </span>
        <h2>상담신청이 접수되었어요.</h2>
        <p>담당자가 브랜드와 대여 일정을 확인한 뒤 남겨 주신 연락처로 연락드릴게요. 영업일 기준 2~3일 정도 걸릴 수 있어요.</p>
        <a className="btn btn-dark" href="/products">
          제품 더 둘러보기
        </a>
      </section>
    );
  }

  const req = <span className="req">{t.required}</span>;
  const brandSelect = (n: 1 | 2, value: string, set: (v: string) => void, setP: (v: string) => void) => (
    <div className="field">
      <label className="field-label" htmlFor={`f-brand${n}`}>
        참여 희망 브랜드 {n}
        {n === 1 ? req : <span className="to-opt">선택</span>}
      </label>
      <select
        id={`f-brand${n}`}
        className="select"
        required={n === 1 && mode === "direct"}
        value={value}
        onChange={(e) => {
          set(e.target.value);
          setP("");
        }}
      >
        <option value="" disabled={n === 1}>
          {n === 1 ? "브랜드를 골라 주세요" : "더 고르지 않을래요"}
        </option>
        {groups.map(([label, list]) => (
          <optgroup key={label} label={label}>
            {list.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
  const productSelect = (n: 1 | 2, brandId: string, value: string, set: (v: string) => void) => (
    <div className="field">
      <label className="field-label" htmlFor={`f-product${n}`}>
        관심 제품 {n} <span className="to-opt">선택</span>
      </label>
      <select id={`f-product${n}`} className="select" value={value} onChange={(e) => set(e.target.value)} disabled={!brandId}>
        <option value="">{brandId ? "아직 정하지 않았어요 (상담 때 추천받기)" : "브랜드를 먼저 골라 주세요"}</option>
        {(byBrand.get(brandId) ?? []).map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <fieldset className="to-fieldset">
        <legend>신청하는 분</legend>
        <div className="form-row">
          <div className="field">
            <label className="field-label" htmlFor="f-name">
              {def.nameLabel.ko}
              {req}
            </label>
            <input id="f-name" name="name" className="input" required maxLength={100} autoComplete="name" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="f-email">
              {t.email}
              {req}
            </label>
            <input id="f-email" name="email" type="email" className="input" required maxLength={LIMITS.short} autoComplete="email" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field-label" htmlFor="f-phone">
              {t.phone}
              {req}
            </label>
            <input id="f-phone" name="phone" type="tel" className="input" required minLength={8} maxLength={50} autoComplete="tel" placeholder={t.phonePh} />
          </div>
        </div>
        {def.fields
          .filter((f) => CHANNEL_KEYS.includes(f.key))
          .map((f) => (
            <FieldInput key={f.key} field={f} req={req} />
          ))}
      </fieldset>

      <fieldset className="to-fieldset">
        <legend>써보고 싶은 브랜드·제품 (1곳 필수, 최대 2곳)</legend>
        <div className="to-mode" role="group" aria-label="고르는 방법">
          <button type="button" aria-pressed={mode === "wish"} onClick={() => setMode("wish")}>
            ♥ 찜한 제품에서 고르기{ready && wished.length ? ` (${wished.length})` : ""}
          </button>
          <button type="button" aria-pressed={mode === "direct"} onClick={() => setMode("direct")}>
            직접 고르기
          </button>
        </div>

        {mode === "wish" ? (
          !ready ? null : wished.length === 0 ? (
            <div className="to-empty-wish">
              아직 찜한 제품이 없어요. <a href="/products">TO 제품 리스트</a>에서 마음에 드는 제품의 ♡를 눌러 찜해 두면 여기서 바로 고를 수 있어요. 지금 바로 고르려면 &lsquo;직접 고르기&rsquo;를 눌러 주세요.
            </div>
          ) : (
            <>
              <p className="to-help">찜한 제품 중에서 <b>1~2개</b>를 골라 주세요. {picked.length === 2 ? "2개를 모두 골랐어요." : `${picked.length}개 골랐어요.`}</p>
              <ul className="to-wishlist">
                {wished.map((p) => {
                  const idx = picked.indexOf(p.id);
                  const full = picked.length >= 2 && idx < 0;
                  return (
                    <li key={p.id}>
                      <label className="to-wishitem">
                        <input type="checkbox" checked={idx >= 0} disabled={full} onChange={() => togglePick(p.id)} />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.image ? <img src={p.image} alt="" loading="lazy" /> : <span className="to-wish-noimg" />}
                        <span>
                          <small>{bById.get(p.brandId)?.name ?? ""}</small>
                          <b>{p.name}</b>
                          {idx >= 0 && <span className="to-slot">{idx === 0 ? "첫 번째로 신청" : "두 번째로 신청"}</span>}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="to-wish-x"
                        aria-label={`${p.name} 찜 해제`}
                        title="찜 해제"
                        onClick={() => {
                          removeWish(p.id);
                          setPicked((cur) => cur.filter((x) => x !== p.id));
                        }}
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="to-help">
                더 찜하고 싶다면 <a href="/products">TO 제품 리스트</a>에서 ♡를 눌러 주세요.
              </p>
            </>
          )
        ) : (
          <>
            <p className="to-help">티오에 참여 중인 브랜드를 <b>1곳 이상</b> 골라 주세요 (최대 2곳). 제품까지 정했다면 함께 골라 주시고, 아직이면 상담 때 추천해 드려요.</p>
            <div className="to-pair">
              <div className="to-pair-col">
                {brandSelect(1, b1, setB1, setP1)}
                {productSelect(1, b1, p1, setP1)}
              </div>
              <div className="to-pair-col">
                {brandSelect(2, b2, setB2, setP2)}
                {productSelect(2, b2, p2, setP2)}
              </div>
            </div>
          </>
        )}
        {def.fields
          .filter((f) => f.kind === "checkboxes")
          .map((f) => (
            <FieldInput key={f.key} field={f} req={req} />
          ))}
      </fieldset>

      <div className="field">
        <label className="field-label" htmlFor="f-message">
          {t.message}
        </label>
        <textarea id="f-message" name="message" className="textarea" maxLength={LIMITS.message} placeholder="원하는 대여 시기, 촬영 계획, 궁금한 점 등을 자유롭게 적어 주세요." />
      </div>

      {/* 스팸 봇 차단용 숨김 필드 — 사람은 보지 못합니다 */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <section className="privacy" aria-labelledby="privacy-title">
        <h2 id="privacy-title">{t.privacyTitle}</h2>
        <dl>
          {t.privacyRows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{k === "수집 항목" ? `${v}, 참여 희망 브랜드·제품` : v}</dd>
            </div>
          ))}
        </dl>
        <p>{t.privacyNote}</p>
        <label className="agree">
          <input type="checkbox" name="privacy" required />
          {t.privacyAgree}
        </label>
      </section>

      {status === "error" && error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div>
        <button className="btn btn-dark" type="submit" disabled={status === "sending"}>
          {status === "sending" ? t.submitting : "상담신청 보내기"}
        </button>
      </div>
    </form>
  );
}

function FieldInput({ field: f, req }: { field: Field; req: React.ReactNode }) {
  const id = `f-${f.key}`;
  if (f.kind === "checkboxes" || f.kind === "radio") {
    return (
      <fieldset className="field">
        <legend className="field-label">
          {f.label.ko}
          {f.required && req}
        </legend>
        <div className="choices" style={{ marginTop: 8 }}>
          {f.options!.map((o, i) => (
            <label className="choice" key={o.value}>
              <input type={f.kind === "radio" ? "radio" : "checkbox"} name={f.key} value={o.value} required={f.kind === "radio" && f.required && i === 0} />
              {o.label.ko}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  if (f.kind === "select") {
    return (
      <div className="field">
        <label className="field-label" htmlFor={id}>
          {f.label.ko}
          {f.required && req}
        </label>
        <select id={id} name={f.key} className="select" required={f.required} defaultValue="">
          <option value="" disabled={f.required}>
            {t.select}
          </option>
          {f.options!.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label.ko}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {f.label.ko}
        {f.required && req}
      </label>
      <input
        id={id}
        name={f.key}
        type={f.kind === "url" ? "url" : "text"}
        className="input"
        required={f.required}
        maxLength={LIMITS.short}
        placeholder={f.placeholder?.ko}
        inputMode={f.kind === "url" ? "url" : undefined}
      />
    </div>
  );
}
