"use client";

// 화면에 보이면 0부터 목표 숫자까지 올라갑니다. (JS가 없거나 움직임 줄이기 설정이면 처음부터 최종 숫자)
import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "@/lib/confetti";

export default function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const target = Number(value);
  const decimals = value.includes(".") ? value.split(".")[1].length : 0;
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(target) || target <= 1 || reducedMotion()) return;
    setShown((0).toFixed(decimals));
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - k, 3);
          setShown((target * eased).toFixed(decimals));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, decimals, duration]);

  return (
    <span ref={ref} className="countup">
      {shown}
    </span>
  );
}
