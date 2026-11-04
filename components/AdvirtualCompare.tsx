"use client";

// 애드버추얼 전/후 비교: 막대를 좌우로 밀면 원본 영상 위에 가상 광고가 나타납니다.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Lang } from "@/lib/forms";
import { getDict } from "@/lib/dictionary";
import { getFun } from "@/lib/fun";
import { reducedMotion } from "@/lib/confetti";
import { Bag } from "./Icons";

export default function AdvirtualCompare({ lang }: { lang: Lang }) {
  const m = getDict(lang).hero.mock;
  const c = getFun(lang).compare;
  const [pos, setPos] = useState(40);
  const touched = useRef(false);
  const frame = useRef<HTMLDivElement>(null);

  // 처음 화면에 보일 때 한 번, 막대가 살짝 오갔다 돌아오며 "밀 수 있다"는 걸 보여 줍니다.
  useEffect(() => {
    const el = frame.current;
    if (!el || reducedMotion()) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const keys = [40, 82, 22, 40];
        const seg = 650;
        let t0 = 0;
        const step = (now: number) => {
          if (touched.current) return;
          if (!t0) t0 = now;
          const t = (now - t0) / seg;
          const i = Math.floor(t);
          if (i >= keys.length - 1) return setPos(keys[keys.length - 1]);
          const k = t - i;
          const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          setPos(keys[i] + (keys[i + 1] - keys[i]) * ease);
          raf = requestAnimationFrame(step);
        };
        setTimeout(() => (raf = requestAnimationFrame(step)), 700);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const style = { "--pos": `${pos}%` } as CSSProperties;

  return (
    <figure className="mock">
      <div className="mock-frame compare" style={style} ref={frame}>
        <div className="mock-head" />
        <div className="mock-body" />
        <div className="compare-after" aria-hidden="true">
          <div className="mock-ad">
            <span>{m.adTag}</span>
            <span>{m.adTitle}</span>
          </div>
          <div className="mock-shop">
            <span className="mock-shop-icon">
              <Bag />
            </span>
            <span className="mock-shop-text">
              <b>{m.shopTitle}</b>
              <small>{m.shopSub}</small>
            </span>
          </div>
        </div>
        <span className="compare-tag is-before" aria-hidden="true">
          {c.before}
        </span>
        <span className="compare-tag is-after" aria-hidden="true">
          {c.after}
        </span>
        <input
          className="compare-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pos)}
          aria-label={c.sliderLabel}
          aria-valuetext={`${c.after} ${100 - Math.round(pos)}%`}
          onChange={(e) => {
            touched.current = true;
            setPos(Number(e.target.value));
          }}
          onPointerDown={() => (touched.current = true)}
        />
        <div className="compare-handle" aria-hidden="true">
          <span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </span>
        </div>
        <div className="mock-progress" />
      </div>
      <figcaption>
        {m.caption} <b className="compare-hint">{c.hint}</b>
      </figcaption>
    </figure>
  );
}
