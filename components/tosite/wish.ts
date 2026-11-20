"use client";

import { useEffect, useState } from "react";

// to.vigtiger.com 찜 목록 — 로그인 없이 이 브라우저에만 저장 (제품 ID 목록)
const KEY = "to-wish-v1";
const EVT = "to-wish-change";
const MAX = 50;

export function readWish(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}
function writeWish(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
  } catch {
    /* 저장이 막힌 브라우저(사생활 보호 모드 등)에서는 이번 화면에서만 유지 */
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: ids }));
}
export function toggleWish(id: string) {
  const cur = readWish();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
  writeWish(next);
  return next.includes(id);
}
export function addWish(id: string) {
  const cur = readWish();
  if (!cur.includes(id)) writeWish([id, ...cur]);
}
export function removeWish(id: string) {
  writeWish(readWish().filter((x) => x !== id));
}

/** 찜 목록을 구독 (다른 탭에서 바꿔도 반영) */
export function useWish() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setIds(readWish());
    setReady(true);
    const onChange = (e: Event) => setIds((e as CustomEvent<string[]>).detail ?? readWish());
    const onStorage = (e: StorageEvent) => e.key === KEY && setIds(readWish());
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return { ids, ready };
}
