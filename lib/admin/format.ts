import { FORMS, type FormType } from "@/lib/forms";
import type { Application, Status } from "./db";

export const TYPE_LABEL: Record<FormType, string> = {
  creator: "크리에이터",
  advertiser: "광고주",
  partner: "상품 파트너",
};

export const STATUS_LABEL: Record<Status, string> = {
  new: "신규",
  in_review: "검토 중",
  contacted: "연락함",
  done: "진행 확정",
  rejected: "보류·종료",
};

export const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  new: { bg: "#FF6A1F", fg: "#111111" },
  in_review: { bg: "#FFE3A3", fg: "#5A3D00" },
  contacted: { bg: "#D6E6FF", fg: "#163B7A" },
  done: { bg: "#D3F2DD", fg: "#11552A" },
  rejected: { bg: "#E6E6E6", fg: "#4A4A4A" },
};

/** 한국 시간으로 표시 */
export function kst(iso: string, withTime = true) {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  });
  return f.format(d).replace(/\.\s?/g, ".").replace(/\.$/, "").replace(/\.(\d{2}:)/, " $1");
}

/** 신청서 상세 답변을 사람이 읽는 라벨로 바꿉니다. */
export function detailRows(a: Application): { label: string; value: string }[] {
  const def = FORMS[a.type];
  if (!def) return [];
  return def.fields.map((f) => {
    const raw = a.details?.[f.key];
    const toLabel = (v: string) => f.options?.find((o) => o.value === v)?.label.ko ?? v;
    const value = Array.isArray(raw) ? raw.map(toLabel).join(", ") : raw ? toLabel(raw) : "";
    return { label: f.label.ko, value };
  });
}

/** 목록에 보여줄 핵심 정보 한 줄 */
export function summary(a: Application) {
  const rows = Object.fromEntries(detailRows(a).map((r) => [r.label, r.value]));
  const pick = (...labels: string[]) => labels.map((l) => rows[l]).filter(Boolean).join(" · ");
  if (a.type === "creator") return pick("구독자 수", "채널 카테고리", "관심 있는 서비스");
  if (a.type === "advertiser") return pick("홍보할 제품·서비스", "예상 예산", "희망 집행 시기");
  return pick("대표 상품", "제품 카테고리", "티오(크리에이터 무료 대여) 참여 의향");
}
