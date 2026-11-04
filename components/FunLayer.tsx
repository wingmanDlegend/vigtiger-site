"use client";

// 공개 페이지 공통 재미 요소
// 1) 협업 문의 영역이 보이는 동안 호랑이가 오른쪽 아래에서 고개를 내밉니다
// 2) 로고(V)를 빠르게 5번 누르면 호랑이가 "어흥!" 하고 나타납니다 (숨은 장난)
// 3) data-tilt 카드에 마우스를 올리면 살짝 기울어집니다
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/forms";
import { getFun } from "@/lib/fun";
import { confetti, reducedMotion } from "@/lib/confetti";
import { track } from "@/lib/track";
import Tiger from "./Tiger";

export default function FunLayer({ lang }: { lang: Lang }) {
  const t = getFun(lang).tiger;
  const [peek, setPeek] = useState<"off" | "in" | "roar">("off");
  const [bigRoar, setBigRoar] = useState(false);
  const peekBtn = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // 1) 고개 내밀기 — 협업 문의 영역이 보이는 동안 나와 있고, 벗어나면 들어갑니다.
  //    (누르면 "어흥!" 후 들어가고, 영역을 벗어났다 다시 오면 또 나옵니다)
  const roared = useRef(false);
  useEffect(() => {
    setPeek("off");
    roared.current = false;
    const target = document.getElementById("contact");
    if (!target) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!roared.current) setPeek((p) => (p === "off" ? "in" : p));
        } else {
          roared.current = false;
          setPeek((p) => (p === "roar" ? p : "off"));
        }
      },
      { threshold: 0.15 },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [pathname]);

  // 2) 로고 5번 → 어흥
  useEffect(() => {
    let count = 0;
    let last = 0;
    const onClick = (e: MouseEvent) => {
      const logo = (e.target as Element | null)?.closest?.(".logo");
      if (!logo) return;
      const now = Date.now();
      count = now - last < 1500 ? count + 1 : 1;
      last = now;
      if (count >= 5) {
        count = 0;
        setBigRoar(true);
        confetti({ y: window.innerHeight * 0.55, count: 180 });
        track("easter_egg", { kind: "logo_roar" });
        setTimeout(() => setBigRoar(false), 2400);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // 3) 카드 기울기
  useEffect(() => {
    if (reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let active: HTMLElement | null = null;
    const reset = (el: HTMLElement) => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
      el.classList.remove("is-tilting");
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-tilt]") ?? null;
      if (active && active !== el) reset(active);
      active = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
      el.classList.add("is-tilting");
    };
    const onLeave = () => active && reset(active);
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  function roarPeek() {
    roared.current = true;
    setPeek("roar");
    const r = peekBtn.current?.getBoundingClientRect();
    confetti({ x: r ? r.left + r.width / 2 : undefined, y: r ? r.top : undefined, count: 90 });
    track("easter_egg", { kind: "peek_roar" });
    setTimeout(() => setPeek("off"), 1600);
  }

  return (
    <>
      {peek !== "off" && (
        <div className={`tiger-peek ${peek === "roar" ? "is-roar" : ""}`}>
          <p className="tiger-bubble" role="status">
            {peek === "roar" ? t.roar : t.peek}
          </p>
          <button type="button" ref={peekBtn} className="tiger-peek-btn" onClick={roarPeek} aria-label={t.label}>
            <Tiger size={84} mood={peek === "roar" ? "roar" : "happy"} />
          </button>
        </div>
      )}
      {bigRoar && (
        <div className="tiger-roar" role="status">
          <p className="tiger-roar-text">{t.roar}</p>
          <Tiger size={220} mood="roar" title={t.label} />
        </div>
      )}
    </>
  );
}
