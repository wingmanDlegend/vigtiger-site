"use client";

// 공개 페이지 공통 재미 요소
// 1) 협업 문의 영역에 닿으면 호랑이가 오른쪽 아래에서 고개를 내밉니다 (세션당 한 번)
// 2) 로고(V)를 빠르게 5번 누르면 호랑이가 "어흥!" 하고 나타납니다 (숨은 장난)
// 3) data-tilt 카드에 마우스를 올리면 살짝 기울어집니다
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/forms";
import { getFun } from "@/lib/fun";
import { confetti, reducedMotion } from "@/lib/confetti";
import { track } from "@/lib/track";
import Tiger from "./Tiger";

const PEEK_KEY = "vt_tiger_peeked";

export default function FunLayer({ lang }: { lang: Lang }) {
  const t = getFun(lang).tiger;
  const [peek, setPeek] = useState<"off" | "in" | "roar">("off");
  const [bigRoar, setBigRoar] = useState(false);
  const peekBtn = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // 1) 고개 내밀기
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(PEEK_KEY) === "1";
    } catch {}
    if (seen) return;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let io: IntersectionObserver | undefined;
    const attach = () => {
      const target = document.getElementById("contact");
      if (!target) return;
      // (페이지를 옮길 때마다 새 페이지의 협업 문의 영역을 다시 지켜봅니다)
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io?.disconnect();
          try {
            sessionStorage.setItem(PEEK_KEY, "1");
          } catch {}
          setPeek("in");
          hideTimer = setTimeout(() => setPeek((p) => (p === "in" ? "off" : p)), 8000);
        },
        { threshold: 0.35 },
      );
      io.observe(target);
    };
    attach();
    return () => {
      io?.disconnect();
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  // 2) 로고 5번 → 어흥
  useEffect(() => {
    let count = 0;
    let last = 0;
    const onClick = (e: MouseEvent) => {
      const logo = (e.target as Element | null)?.closest?.(".logo");
      if (!logo) return;
      const now = Date.now();
      count = now - last < 1200 ? count + 1 : 1;
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
