"use client";

// 티오 참여 브랜드 전체 목록 — 분야 탭으로 걸러 보기
import { useState } from "react";
import type { Lang } from "@/lib/forms";
import { BRAND_CATEGORIES, BRAND_TEXT, BRAND_TOTAL } from "@/lib/brands";

type Group = { key: string; ko: string; en: string; brands: string[] };

// groups: 지금 티오에 노출 중인 브랜드 (서버에서 넘김). 없으면 기본 목록
export default function BrandDirectory({ lang, groups }: { lang: Lang; groups?: Group[] }) {
  const t = BRAND_TEXT[lang];
  const [cat, setCat] = useState<string>("all");
  const all: Group[] = groups ?? BRAND_CATEGORIES;
  const total = groups ? groups.reduce((n, g) => n + g.brands.length, 0) : BRAND_TOTAL;
  const shown = cat === "all" ? all : all.filter((c) => c.key === cat);

  return (
    <div className="brand-dir">
      <div className="brand-tabs" role="group" aria-label={lang === "ko" ? "분야" : "Category"}>
        <button type="button" aria-pressed={cat === "all"} onClick={() => setCat("all")}>
          {t.all} <small>{t.count(total)}</small>
        </button>
        {all.map((c) => (
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
