"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { FORMS, LIMITS, type Field, type FormType, type Lang } from "@/lib/forms";
import { getDict, homePath } from "@/lib/dictionary";
import { Check } from "./Icons";

type Status = "idle" | "sending" | "done" | "error";

export default function ApplyForm({ lang, type }: { lang: Lang; type: FormType }) {
  const t = getDict(lang).apply;
  const def = FORMS[type];
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // 체크박스 묶음은 브라우저 기본 검증이 안 되므로 직접 확인
    for (const f of def.fields) {
      if (f.kind === "checkboxes" && f.required && fd.getAll(f.key).length === 0) {
        setError(t.errorRequired);
        setStatus("error");
        form.querySelector<HTMLInputElement>(`input[name="${f.key}"]`)?.focus();
        return;
      }
    }

    const details: Record<string, string | string[]> = {};
    for (const f of def.fields) {
      details[f.key] = f.kind === "checkboxes" ? (fd.getAll(f.key) as string[]) : String(fd.get(f.key) ?? "");
    }

    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          lang,
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          privacyAgreed: fd.get("privacy") === "on",
          website: fd.get("website"), // 스팸 방지용 숨김 필드
          details,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error === "invalid" ? t.errorRequired : t.errorServer);
        setStatus("error");
        return;
      }
      setStatus("done");
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
        <h2>{t.successTitle}</h2>
        <p>{t.successBody}</p>
        <Link className="btn btn-dark" href={homePath(lang)}>
          {t.successHome}
        </Link>
      </section>
    );
  }

  const req = <span className="req">{t.required}</span>;

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <div className="form-row">
        <div className="field">
          <label className="field-label" htmlFor="f-name">
            {def.nameLabel[lang]}
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
          </label>
          <input
            id="f-phone"
            name="phone"
            type="tel"
            className="input"
            maxLength={50}
            autoComplete="tel"
            placeholder={t.phonePh}
          />
        </div>
      </div>

      {def.fields.map((f) => (
        <FieldInput key={f.key} field={f} lang={lang} req={req} selectText={t.select} />
      ))}

      <div className="field">
        <label className="field-label" htmlFor="f-message">
          {t.message}
        </label>
        <textarea id="f-message" name="message" className="textarea" maxLength={LIMITS.message} placeholder={t.messagePh} />
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
              <dd>{v}</dd>
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
          {status === "sending" ? t.submitting : t.submit}
        </button>
      </div>
    </form>
  );
}

function FieldInput({
  field: f,
  lang,
  req,
  selectText,
}: {
  field: Field;
  lang: Lang;
  req: React.ReactNode;
  selectText: string;
}) {
  const id = `f-${f.key}`;

  if (f.kind === "checkboxes" || f.kind === "radio") {
    return (
      <fieldset className="field">
        <legend className="field-label">
          {f.label[lang]}
          {f.required && req}
        </legend>
        <div className="choices" style={{ marginTop: 8 }}>
          {f.options!.map((o, i) => (
            <label className="choice" key={o.value}>
              <input
                type={f.kind === "radio" ? "radio" : "checkbox"}
                name={f.key}
                value={o.value}
                required={f.kind === "radio" && f.required && i === 0}
              />
              {o.label[lang]}
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
          {f.label[lang]}
          {f.required && req}
        </label>
        <select id={id} name={f.key} className="select" required={f.required} defaultValue="">
          <option value="" disabled={f.required}>
            {selectText}
          </option>
          {f.options!.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label[lang]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {f.label[lang]}
        {f.required && req}
      </label>
      <input
        id={id}
        name={f.key}
        type={f.kind === "url" ? "url" : "text"}
        className="input"
        required={f.required}
        maxLength={LIMITS.short}
        placeholder={f.placeholder?.[lang]}
        inputMode={f.kind === "url" ? "url" : undefined}
      />
    </div>
  );
}
