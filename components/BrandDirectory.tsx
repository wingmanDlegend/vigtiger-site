"use client";

// 티오 참여 브랜드 전체 목록 — 분야 탭으로 걸러 보기
import { useState } from "react";
import type { Lang } from "@/lib/forms";
import { BRAND_CATEGORIES, BRAND_TEXT, BRAND_TOTAL } from "@/lib/brands";

export default function BrandDirectory({ lang }: { lang: Lang }) {
  const t = BRAND_TEXT[lang];
  const [cat, setCat] = useState<string>("all");
  const shown = cat === "all" ? BRAND_CATEGORIES : BRAND_CATEGORIES.filter((c) => c.key === cat);

  return (
    <div className="brand-dir">
      <div className="brand-tabs" role="group" aria-label={lang === "ko" ? "분야" : "Category"}>
        <button type="button" aria-pressed={cat === "all"} onClick={() => setCat("all")}>
          {t.all} <small>{t.count(BRAND_TOTAL)}</small>
        </button>
        {BRAND_CATEGORIES.map((c) => (
          <button type="button" key={c.key} aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>
            {lang === "ko" ? c.ko : c.en} <small>{t.count(c.brands.length)}</small>
          </button>
        ))}
      </div>
      <div className="brand-groups" aria-live="polite">
        {shown.map((c) => (
          <section key={c.key} className="brand-group" aria-label={lang === "ko" ? c.ko : c.en}>
            {cat === "all" && (
              <h3>
                {lang === "ko" ? c.ko : c.en} <small>{t.count(c.brands.length)}</small>
              </h3>
            )}
            <ul className="brand-grid">
              {c.brands.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
