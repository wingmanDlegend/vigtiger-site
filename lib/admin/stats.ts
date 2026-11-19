import "server-only";
import { FORMS, type FormType } from "@/lib/forms";

// 대시보드 공통 계산 (한국 시간 기준)

const KST = 9 * 3600e3;
export const kstDate = (iso: string) => new Date(new Date(iso).getTime() + KST).toISOString().slice(0, 10);
export const monthKey = (isoOrDate: string) => (isoOrDate.length === 10 ? isoOrDate : kstDate(isoOrDate)).slice(0, 7);
export const todayKst = () => new Date(Date.now() + KST).toISOString().slice(0, 10);

/** 최근 n개월 키 (오래된 → 최근) */
export function lastMonths(n: number, from = todayKst()) {
  const [y, m] = from.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}
export const monthLabel = (k: string) => `${Number(k.slice(5, 7))}월`;
export const monthLabelLong = (k: string) => `${k.slice(0, 4)}년 ${Number(k.slice(5, 7))}월`;

export type RangeKey = "30d" | "90d" | "year" | "all";
export const RANGES: { key: RangeKey; label: string }[] = [
  { key: "30d", label: "최근 30일" },
  { key: "90d", label: "최근 90일" },
  { key: "year", label: "올해" },
  { key: "all", label: "전체" },
];
export const parseRange = (v?: string): RangeKey => (["30d", "90d", "year", "all"].includes(v ?? "") ? (v as RangeKey) : "90d");

/** 기간 [시작, 끝) 과 직전 같은 길이 기간 (KST 날짜 문자열) */
export function rangeBounds(r: RangeKey) {
  const today = todayKst();
  const t = new Date(`${today}T00:00:00Z`);
  const add = (d: Date, days: number) => new Date(d.getTime() + days * 86400e3).toISOString().slice(0, 10);
  const end = add(t, 1);
  if (r === "all") return { start: "0000-01-01", end, prevStart: null as string | null, prevEnd: null as string | null };
  if (r === "year") {
    const start = `${today.slice(0, 4)}-01-01`;
    const prevStart = `${Number(today.slice(0, 4)) - 1}-01-01`;
    const prevEnd = add(new Date(`${prevStart}T00:00:00Z`), Math.round((t.getTime() - new Date(`${start}T00:00:00Z`).getTime()) / 86400e3) + 1);
    return { start, end, prevStart, prevEnd };
  }
  const days = r === "30d" ? 30 : 90;
  const start = add(t, -(days - 1));
  return { start, end, prevStart: add(t, -(2 * days - 1)), prevEnd: start };
}
export const inRange = (d: string | null | undefined, a: string, b: string) => !!d && d >= a && d < b;

export function countBy<T>(rows: T[], key: (r: T) => string | string[] | null | undefined) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    for (const v of Array.isArray(k) ? k : k ? [k] : []) m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** 신청서 선택지 값 → 한글 라벨 */
export function optionLabel(type: FormType, key: string, value: string) {
  const f = FORMS[type].fields.find((x) => x.key === key);
  return f?.options?.find((o) => o.value === value)?.label.ko ?? value;
}
/** 선택지 정의 순서 (막대 순서를 선택지 순서로 고정할 때) */
export function optionOrder(type: FormType, key: string) {
  return FORMS[type].fields.find((x) => x.key === key)?.options?.map((o) => o.value) ?? [];
}

export function delta(cur: number, prev: number | null) {
  if (prev === null) return null;
  if (prev === 0) return cur === 0 ? 0 : null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}
