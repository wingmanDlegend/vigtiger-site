// 공동구매 결과 — 항목 정의·검증·계산 (화면·엑셀 업로드·서버가 함께 씀)

export type GBStatus = "planned" | "live" | "done" | "canceled";
export type GBRerun = "recommend" | "hold" | "no";

export type GroupBuy = {
  id: string;
  created_at: string;
  updated_at: string;
  brand: string;
  product: string;
  creator: string;
  platform: string | null;
  start_date: string | null;
  end_date: string | null;
  status: GBStatus;
  list_price: number | null;
  deal_price: number | null;
  units: number | null;
  revenue: number | null;
  commission_rate: number | null;
  creator_payout: number | null;
  company_profit: number | null;
  settled: boolean;
  settled_at: string | null;
  content_url: string | null;
  views: number | null;
  clicks: number | null;
  rerun: GBRerun | null;
  rerun_reason: string | null;
  memo: string | null;
};

export type GBInput = Omit<GroupBuy, "id" | "created_at" | "updated_at">;

export const STATUS_LABEL: Record<GBStatus, string> = {
  planned: "진행 예정",
  live: "진행 중",
  done: "완료",
  canceled: "취소",
};
export const STATUS_STYLE: Record<GBStatus, { bg: string; fg: string }> = {
  planned: { bg: "#eef2ff", fg: "#2b3a8f" },
  live: { bg: "#fff1e6", fg: "#a12a00" },
  done: { bg: "#e9f7ee", fg: "#11552a" },
  canceled: { bg: "#f0ece6", fg: "#5a5a5a" },
};
export const RERUN_LABEL: Record<GBRerun, string> = {
  recommend: "재진행 추천",
  hold: "보류",
  no: "재진행 안 함",
};
export const PLATFORMS = ["YouTube", "Instagram", "TikTok", "네이버 쇼핑라이브", "블로그", "기타"];

type Kind = "text" | "longtext" | "url" | "date" | "money" | "int" | "pct" | "bool" | "status" | "rerun";
export type FieldDef = {
  key: keyof GBInput;
  label: string;
  kind: Kind;
  group: "basic" | "sales" | "settle" | "content" | "rerun" | "memo";
  required?: boolean;
  aliases?: string[]; // 엑셀 머리글로 인식할 다른 이름
  max?: number;
};

export const GROUPS: { key: FieldDef["group"]; label: string }[] = [
  { key: "basic", label: "기본 정보" },
  { key: "sales", label: "판매 실적" },
  { key: "settle", label: "수익 정산" },
  { key: "content", label: "콘텐츠 성과" },
  { key: "rerun", label: "재진행 판단" },
  { key: "memo", label: "메모" },
];

export const FIELDS: FieldDef[] = [
  { key: "brand", label: "브랜드", kind: "text", group: "basic", required: true, aliases: ["브랜드명", "업체", "업체명"], max: 120 },
  { key: "product", label: "제품", kind: "text", group: "basic", required: true, aliases: ["제품명", "상품", "상품명"], max: 200 },
  { key: "creator", label: "크리에이터", kind: "text", group: "basic", required: true, aliases: ["채널", "채널명", "인플루언서", "유튜버"], max: 120 },
  { key: "platform", label: "플랫폼", kind: "text", group: "basic", aliases: ["채널 플랫폼", "SNS"], max: 40 },
  { key: "start_date", label: "시작일", kind: "date", group: "basic", aliases: ["공구 시작일", "진행 시작일", "오픈일"] },
  { key: "end_date", label: "종료일", kind: "date", group: "basic", aliases: ["공구 종료일", "진행 종료일", "마감일"] },
  { key: "status", label: "상태", kind: "status", group: "basic", aliases: ["진행 상태"] },

  { key: "list_price", label: "정가", kind: "money", group: "sales", aliases: ["소비자가", "판매가", "정상가"] },
  { key: "deal_price", label: "공구가", kind: "money", group: "sales", aliases: ["공동구매가", "할인가", "판매 단가"] },
  { key: "units", label: "판매 수량", kind: "int", group: "sales", aliases: ["판매수량", "수량", "판매량", "주문 수량"] },
  { key: "revenue", label: "총 매출", kind: "money", group: "sales", aliases: ["매출", "매출액", "총매출", "판매액", "GMV"] },

  { key: "commission_rate", label: "크리에이터 수수료율(%)", kind: "pct", group: "settle", aliases: ["수수료율", "수수료", "커미션", "수수료(%)"] },
  { key: "creator_payout", label: "크리에이터 정산액", kind: "money", group: "settle", aliases: ["크리에이터 정산", "정산액", "크리에이터 수익"] },
  { key: "company_profit", label: "회사 수익", kind: "money", group: "settle", aliases: ["회사수익", "당사 수익", "순수익", "마진"] },
  { key: "settled", label: "정산 완료", kind: "bool", group: "settle", aliases: ["정산 여부", "정산여부", "정산"] },
  { key: "settled_at", label: "정산일", kind: "date", group: "settle", aliases: ["정산 일자", "지급일"] },

  { key: "content_url", label: "콘텐츠 링크", kind: "url", group: "content", aliases: ["링크", "영상 링크", "게시물 링크", "URL"], max: 1000 },
  { key: "views", label: "조회수", kind: "int", group: "content", aliases: ["조회 수", "뷰"] },
  { key: "clicks", label: "클릭 수", kind: "int", group: "content", aliases: ["클릭수", "클릭", "링크 클릭"] },

  { key: "rerun", label: "재진행 판단", kind: "rerun", group: "rerun", aliases: ["재진행", "재진행 여부"] },
  { key: "rerun_reason", label: "판단 이유", kind: "longtext", group: "rerun", aliases: ["재진행 이유", "평가", "코멘트"], max: 2000 },

  { key: "memo", label: "메모", kind: "longtext", group: "memo", aliases: ["비고", "참고"], max: 4000 },
];

const norm = (s: string) => s.replace(/\s|\(|\)|%|원|\*|_/g, "").toLowerCase();

/** 엑셀 머리글 → 항목 key (모르면 null) */
export function matchHeader(h: string): keyof GBInput | null {
  const n = norm(String(h ?? ""));
  if (!n) return null;
  for (const f of FIELDS) {
    if ([f.label, f.key, ...(f.aliases ?? [])].some((a) => norm(a) === n)) return f.key;
  }
  return null;
}

// ---------- 값 변환 ----------
function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v).trim();
  if (!s || s === "-") return null;
  let mult = 1;
  if (/만\s*원?$/.test(s)) {
    mult = 10000;
    s = s.replace(/만\s*원?$/, "");
  }
  s = s.replace(/[,\s원%₩]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
  return Number(s) * mult;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toDate(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date && !isNaN(v.getTime())) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
  if (typeof v === "number" && v > 20000 && v < 80000) {
    // 엑셀 날짜 일련번호
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})/);
  if (!m) {
    const m2 = s.match(/^(\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
    if (m2) m = [m2[0], `20${m2[1]}`, m2[2], m2[3]] as RegExpMatchArray;
  }
  if (!m) return "invalid";
  const y = Number(m[1]),
    mo = Number(m[2]),
    d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return "invalid";
  return `${y}-${pad(mo)}-${pad(d)}`;
}

function toStatus(v: unknown): GBStatus | null | "invalid" {
  const s = norm(String(v ?? ""));
  if (!s) return null;
  if (["planned", "진행예정", "예정", "대기"].includes(s)) return "planned";
  if (["live", "진행중", "진행", "판매중"].includes(s)) return "live";
  if (["done", "완료", "종료", "마감", "진행완료"].includes(s)) return "done";
  if (["canceled", "cancelled", "취소", "무산"].includes(s)) return "canceled";
  return "invalid";
}
function toRerun(v: unknown): GBRerun | null | "invalid" {
  const s = norm(String(v ?? ""));
  if (!s) return null;
  if (["recommend", "재진행추천", "추천", "재진행", "o", "y", "yes", "예", "좋음"].includes(s)) return "recommend";
  if (["hold", "보류", "검토", "△", "미정"].includes(s)) return "hold";
  if (["no", "재진행안함", "안함", "비추천", "x", "n", "아니오", "중단"].includes(s)) return "no";
  return "invalid";
}
function toBool(v: unknown): boolean | null | "invalid" {
  if (typeof v === "boolean") return v;
  const s = norm(String(v ?? ""));
  if (!s) return null;
  if (["true", "o", "y", "yes", "예", "완료", "정산완료", "1", "v", "✓"].includes(s)) return true;
  if (["false", "x", "n", "no", "아니오", "미정산", "미완료", "0", "대기"].includes(s)) return false;
  return "invalid";
}

/** 한 건 검증·정리. 오류가 있으면 errors에 담아 돌려줌 */
export function cleanGroupbuy(raw: Partial<Record<keyof GBInput, unknown>>): { value: GBInput; errors: string[] } {
  const errors: string[] = [];
  const out: Record<string, unknown> = {};
  for (const f of FIELDS) {
    const v = raw[f.key];
    switch (f.kind) {
      case "text":
      case "longtext": {
        const s = v === null || v === undefined ? "" : String(v).trim();
        if (f.required && !s) errors.push(`${f.label}을(를) 입력해 주세요.`);
        if (f.max && s.length > f.max) errors.push(`${f.label}은(는) ${f.max}자 이내로 입력해 주세요.`);
        out[f.key] = s || null;
        break;
      }
      case "url": {
        const s = v === null || v === undefined ? "" : String(v).trim();
        if (s) {
          try {
            const u = new URL(s);
            if (u.protocol !== "https:" && u.protocol !== "http:") throw 0;
          } catch {
            errors.push(`${f.label}이(가) 올바른 주소가 아닙니다.`);
          }
        }
        out[f.key] = s || null;
        break;
      }
      case "date": {
        const d = toDate(v);
        if (d === "invalid") errors.push(`${f.label} 날짜 형식을 확인해 주세요. (예: 2026-11-19)`);
        out[f.key] = d === "invalid" ? null : d;
        break;
      }
      case "money":
      case "int": {
        const n = toNumber(v);
        if (Number.isNaN(n)) errors.push(`${f.label}에는 숫자만 입력해 주세요.`);
        else if (n !== null && n < 0 && f.key !== "company_profit") errors.push(`${f.label}은(는) 0 이상이어야 합니다.`);
        out[f.key] = n === null || Number.isNaN(n) ? null : Math.round(n);
        break;
      }
      case "pct": {
        const n = toNumber(v);
        if (Number.isNaN(n) || (n !== null && (n < 0 || n > 100))) errors.push(`${f.label}은(는) 0~100 사이 숫자로 입력해 주세요.`);
        out[f.key] = n === null || Number.isNaN(n) || n < 0 || n > 100 ? null : Math.round(n * 100) / 100;
        break;
      }
      case "bool": {
        const b = toBool(v);
        if (b === "invalid") errors.push(`${f.label}은(는) O/X 또는 예/아니오로 입력해 주세요.`);
        out[f.key] = b === true;
        break;
      }
      case "status": {
        const s = toStatus(v);
        if (s === "invalid") errors.push(`상태는 진행 예정/진행 중/완료/취소 중 하나로 입력해 주세요.`);
        out[f.key] = s && s !== "invalid" ? s : "done";
        break;
      }
      case "rerun": {
        const r = toRerun(v);
        if (r === "invalid") errors.push(`재진행 판단은 추천/보류/안 함 중 하나로 입력해 주세요.`);
        out[f.key] = r && r !== "invalid" ? r : null;
        break;
      }
    }
  }
  const value = out as GBInput;
  if (value.start_date && value.end_date && value.end_date < value.start_date) errors.push("종료일이 시작일보다 빠릅니다.");
  // 비어 있으면 자동 계산
  if (value.revenue === null && value.deal_price !== null && value.units !== null) value.revenue = value.deal_price * value.units;
  if (value.creator_payout === null && value.revenue !== null && value.commission_rate !== null)
    value.creator_payout = Math.round((value.revenue * value.commission_rate) / 100);
  if (value.settled && !value.settled_at) value.settled_at = null;
  return { value, errors };
}

// ---------- 표시용 ----------
export const won = (n: number | null | undefined) => (n === null || n === undefined ? "–" : `${n.toLocaleString("ko-KR")}원`);
export const num = (n: number | null | undefined) => (n === null || n === undefined ? "–" : n.toLocaleString("ko-KR"));
export function discountRate(g: Pick<GroupBuy, "list_price" | "deal_price">) {
  if (!g.list_price || g.deal_price === null) return null;
  return Math.round((1 - g.deal_price / g.list_price) * 1000) / 10;
}
export function conversionRate(g: Pick<GroupBuy, "units" | "clicks">) {
  if (!g.clicks || g.units === null) return null;
  return Math.round((g.units / g.clicks) * 1000) / 10;
}
export function period(g: Pick<GroupBuy, "start_date" | "end_date">) {
  const f = (d: string | null) => (d ? d.replaceAll("-", ".") : "");
  if (!g.start_date && !g.end_date) return "–";
  if (g.start_date && g.end_date && g.start_date === g.end_date) return f(g.start_date);
  return `${f(g.start_date)} ~ ${f(g.end_date)}`;
}

/** 엑셀(CSV) 머리글 순서 — 양식·내려받기 공용 */
export const CSV_HEADERS = FIELDS.map((f) => f.label);
export function toCsvCell(g: GroupBuy, f: FieldDef): string | number {
  const v = g[f.key as keyof GroupBuy];
  if (v === null || v === undefined) return "";
  if (f.kind === "status") return STATUS_LABEL[v as GBStatus];
  if (f.kind === "rerun") return RERUN_LABEL[v as GBRerun];
  if (f.kind === "bool") return v ? "O" : "X";
  return v as string | number;
}
export function csvEscape(v: string | number) {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s) && typeof v === "string") s = `'${s}`; // 수식 실행 방지
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
