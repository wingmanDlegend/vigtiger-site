"use client";

// 크리에이터용 "나에게 맞는 서비스 찾기" 퀴즈 — 결과에서 해당 서비스가 체크된 신청서로 연결
import { useRef, useState } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/forms";
import { applyPath, pagePath } from "@/lib/dictionary";
import { getFun, type ServiceKey } from "@/lib/fun";
import { track } from "@/lib/track";
import { confetti } from "@/lib/confetti";
import { ArrowRight } from "./Icons";
import Tiger from "./Tiger";

const ORDER: ServiceKey[] = ["advirtual", "shopping", "to"];

export default function ServiceQuiz({ lang }: { lang: Lang }) {
  const t = getFun(lang).quiz;
  const total = t.questions.length;
  const [step, setStep] = useState(-1); // -1: 시작 전, 0..n-1: 질문, n: 결과
  const [answers, setAnswers] = useState<number[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const [roar, setRoar] = useState(false);
  const tigerBtn = useRef<HTMLButtonElement>(null);
  const fun = getFun(lang).tiger;

  function poke() {
    if (roar) return;
    setRoar(true);
    const r = tigerBtn.current?.getBoundingClientRect();
    confetti({ x: r ? r.left + r.width / 2 : undefined, y: r ? r.top + r.height / 2 : undefined, count: 70 });
    track("easter_egg", { kind: "quiz_tiger" });
    setTimeout(() => setRoar(false), 1300);
  }

  const focusPanel = () => requestAnimationFrame(() => panel.current?.focus({ preventScroll: true }));

  function choose(i: number) {
    const next = [...answers.slice(0, step), i];
    setAnswers(next);
    setStep(step + 1);
    if (step + 1 === total) track("quiz_complete", { result: resultOf(next) });
    focusPanel();
  }

  function resultOf(ans: number[]): ServiceKey {
    const score: Record<ServiceKey, number> = { advirtual: 0, shopping: 0, to: 0 };
    ans.forEach((a, qi) => {
      const s = t.questions[qi].options[a]?.score ?? {};
      for (const k of ORDER) score[k] += s[k] ?? 0;
    });
    // 동점이면 첫 질문(가장 원하는 것)의 답을 우선
    const first = Object.keys(t.questions[0].options[ans[0]]?.score ?? {})[0] as ServiceKey | undefined;
    return [...ORDER].sort((a, b) => score[b] - score[a] || (b === first ? 1 : 0) - (a === first ? 1 : 0))[0];
  }

  const done = step === total;
  const result = done ? resultOf(answers) : null;
  const r = result ? t.results[result] : null;

  return (
    <section className="quiz" aria-labelledby="quiz-title">
      <div className="container section quiz-inner">
        <div className="quiz-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h2" id="quiz-title">
            {t.title[0]}
            <br />
            {t.title[1]}
          </h2>
          <p className="lead">{t.body}</p>
          <button type="button" ref={tigerBtn} className={`quiz-tiger${roar ? " is-roar" : ""}`} onClick={poke} aria-label={fun.label}>
            <Tiger size={112} mood={roar ? "roar" : done ? "wink" : "happy"} />
            {roar && <span className="quiz-tiger-bubble" role="status">{fun.roar}</span>}
          </button>
        </div>

        <div className="quiz-card" ref={panel} tabIndex={-1} aria-live="polite">
          {step === -1 && (
            <div className="quiz-start">
              <ol className="quiz-preview" aria-hidden="true">
                {t.questions.map((q, i) => (
                  <li key={q.q}>
                    <span>{i + 1}</span>
                    {q.q}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  setStep(0);
                  focusPanel();
                }}
              >
                {t.start}
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step >= 0 && !done && (
            <div className="quiz-q" key={step}>
              <div className="quiz-progress">
                <span className="quiz-count">{t.step(step + 1, total)}</span>
                <span className="quiz-bar" aria-hidden="true">
                  <i style={{ width: `${((step + 1) / total) * 100}%` }} />
                </span>
              </div>
              <h3>{t.questions[step].q}</h3>
              <div className="quiz-options">
                {t.questions[step].options.map((o, i) => (
                  <button
                    type="button"
                    key={o.label}
                    className="quiz-option"
                    aria-pressed={answers[step] === i}
                    onClick={() => choose(i)}
                  >
                    <span className="quiz-key" aria-hidden="true">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {o.label}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button type="button" className="quiz-back" onClick={() => setStep(step - 1)}>
                  ← {t.back}
                </button>
              )}
            </div>
          )}

          {done && r && result && (
            <div className="quiz-result">
              <p className="quiz-result-eyebrow">{t.resultEyebrow}</p>
              <h3>{r.name}</h3>
              <p className="quiz-result-line">{r.line}</p>
              <p className="quiz-result-why">{r.why}</p>
              <div className="hero-ctas">
                <Link className="btn btn-accent" href={applyPath(lang, "creator", result)}>
                  {t.apply}
                  <ArrowRight size={18} />
                </Link>
                <Link className="btn btn-outline" href={pagePath(lang, `services/${result}`)}>
                  {t.more}
                </Link>
              </div>
              <button
                type="button"
                className="quiz-back"
                onClick={() => {
                  setAnswers([]);
                  setStep(0);
                  focusPanel();
                }}
              >
                ↻ {t.retry}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
