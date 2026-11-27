import "server-only";
import { FORMS, type FormType, type Lang } from "@/lib/forms";
import { CONTACT } from "@/lib/dictionary";
import { sendMail } from "@/lib/mail";
import { cfg } from "@/lib/admin/db";

// 신청 접수 확인 메일 (신청자에게) — 홈페이지 3종 + to.vigtiger.com 상담신청
type Record_ = {
  type: FormType;
  lang: Lang;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  details: Record<string, unknown>;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const FONT = "'Apple SD Gothic Neo','AppleSDGothicNeo','Noto Sans KR','Malgun Gothic','맑은 고딕',sans-serif";

const COPY = {
  ko: {
    kind: { creator: "크리에이터 비즈니스 상담", advertiser: "광고 신청", partner: "상품 파트너 입점 신청", to: "티오(TO) 상담신청" } as Record<FormType, string>,
    subject: (k: string) => `[대범한사람들] ${k}이 접수되었어요`,
    hello: (n: string) => `${n}님, 안녕하세요.`,
    body: (k: string) => `${k}을 잘 받았어요. 담당자가 내용을 확인한 뒤 남겨 주신 연락처로 연락드릴게요.`,
    when: (t: FormType) =>
      t === "to" ? "브랜드와 대여 가능 여부·일정을 확인하는 데 영업일 기준 2~3일 정도 걸릴 수 있어요." : "보통 영업일 기준 2~3일 안에 연락드려요.",
    summary: "신청하신 내용",
    name: "이름",
    phone: "연락처",
    message: "남기신 말",
    contact: "궁금한 점은 아래로 편하게 연락해 주세요.",
    kakao: "카카오톡 상담",
    sign: "대범한사람들 드림",
    footer: "이 메일은 신청서를 제출하신 분께 자동으로 보내 드리는 확인 메일이에요. 신청하신 적이 없다면 이 메일을 무시해 주세요.",
    toMore: "더 써보고 싶은 제품이 있다면 티오 제품 리스트에서 찜해 두세요.",
  },
  en: {
    kind: { creator: "creator business inquiry", advertiser: "advertising request", partner: "product partner application", to: "TO try-out request" } as Record<FormType, string>,
    subject: (k: string) => `[VIGTIGER] We received your ${k}`,
    hello: (n: string) => `Hi ${n},`,
    body: (k: string) => `Thanks — we received your ${k}. Our team will review it and get back to you using the contact details you left.`,
    when: () => "We usually reply within 2–3 business days.",
    summary: "What you sent us",
    name: "Name",
    phone: "Phone",
    message: "Message",
    contact: "Questions? Reach us anytime below.",
    kakao: "KakaoTalk chat",
    sign: "The VIGTIGER team",
    footer: "This is an automatic confirmation sent to the person who submitted the form. If that wasn't you, please ignore this email.",
    toMore: "",
  },
};

function rows(r: Record_, lang: Lang) {
  const def = FORMS[r.type];
  const out: [string, string][] = [];
  for (const f of def?.fields ?? []) {
    const raw = r.details?.[f.key];
    const label = (v: string) => f.options?.find((o) => o.value === v)?.label[lang] ?? v;
    const v = Array.isArray(raw) ? raw.map((x) => label(String(x))).join(", ") : raw ? label(String(raw)) : "";
    if (v) out.push([f.label[lang], v]);
  }
  return out;
}

export function confirmationMail(r: Record_) {
  const lang: Lang = r.lang === "en" ? "en" : "ko";
  const c = COPY[lang];
  const kind = c.kind[r.type];
  const nameLabel = FORMS[r.type]?.nameLabel?.[lang] ?? c.name;
  const list: [string, string][] = [[nameLabel, r.name], ...(r.phone ? [[c.phone, r.phone] as [string, string]] : []), ...rows(r, lang)];
  if (r.message) list.push([c.message, r.message]);

  const text = [
    c.hello(r.name),
    "",
    c.body(kind),
    c.when(r.type),
    "",
    `■ ${c.summary}`,
    ...list.map(([k, v]) => `- ${k}: ${v}`),
    "",
    ...(r.type === "to" && c.toMore ? [c.toMore, "https://to.vigtiger.com/products", ""] : []),
    c.contact,
    `${CONTACT.email} · ${CONTACT.phone} · ${c.kakao} ${CONTACT.kakao}`,
    "",
    c.sign,
    "",
    c.footer,
  ].join("\n");

  const tr = list
    .map(
      ([k, v]) =>
        `<tr><td width="128" style="width:128px;padding:8px 12px 8px 0;color:#6b6b6b;font-size:13px;vertical-align:top;">${esc(k)}</td><td style="padding:8px 0;color:#111;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(v)}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.subject(kind))}</title></head>
<body style="margin:0;padding:0;background:#f4f3f0;font-family:${FONT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f0;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:${FONT};">
<tr><td style="background:#111111;padding:20px 28px;">
<span style="display:inline-block;background:#ff6a1f;color:#111;font-weight:900;font-size:15px;border-radius:8px;padding:4px 9px;">${r.type === "to" ? "TO" : "V"}</span>
<span style="color:#fff;font-weight:800;font-size:16px;margin-left:8px;">${r.type === "to" ? (lang === "ko" ? "티오 TO · 대범한사람들" : "TO · VIGTIGER") : lang === "ko" ? "대범한사람들" : "VIGTIGER"}</span>
</td></tr>
<tr><td style="padding:32px 28px 8px;">
<p style="margin:0 0 6px;color:#ff6a1f;font-weight:800;font-size:13px;letter-spacing:.04em;">${lang === "ko" ? "접수 완료" : "RECEIVED"}</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:#111;">${esc(c.subject(kind).replace(/^\[[^\]]+\]\s*/, ""))}</h1>
<p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#222;">${esc(c.hello(r.name))}</p>
<p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#222;">${esc(c.body(kind))}</p>
<p style="margin:0;font-size:14px;line-height:1.7;color:#6b6b6b;">${esc(c.when(r.type))}</p>
</td></tr>
<tr><td style="padding:20px 28px 4px;">
<p style="margin:0 0 6px;font-weight:800;font-size:14px;color:#111;">${esc(c.summary)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:2px solid #111;">${tr}</table>
</td></tr>
${
  r.type === "to" && c.toMore
    ? `<tr><td style="padding:20px 28px 0;"><a href="https://to.vigtiger.com/products" style="display:inline-block;background:#ff6a1f;color:#111;font-weight:800;font-size:14px;text-decoration:none;border-radius:10px;padding:12px 18px;">${lang === "ko" ? "티오 제품 더 보기" : "Browse TO products"}</a><p style="margin:8px 0 0;font-size:13px;color:#6b6b6b;">${esc(c.toMore)}</p></td></tr>`
    : ""
}
<tr><td style="padding:24px 28px 28px;">
<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#222;">${esc(c.contact)}</p>
<p style="margin:0;font-size:14px;line-height:1.8;color:#222;"><a href="mailto:${CONTACT.email}" style="color:#111;">${CONTACT.email}</a> · ${esc(CONTACT.phone)} · <a href="${CONTACT.kakao}" style="color:#111;">${esc(c.kakao)}</a></p>
<p style="margin:16px 0 0;font-size:14px;color:#111;font-weight:700;">${esc(c.sign)}</p>
</td></tr>
<tr><td style="background:#f8f7f4;padding:16px 28px;font-size:12px;line-height:1.6;color:#8a8a8a;">${esc(c.footer)}<br>(주)대범한사람들 · ${lang === "ko" ? "서울특별시 강남구 논현로115길 71, 604호" : "Seoul, Korea"} · <a href="https://www.vigtiger.com" style="color:#8a8a8a;">vigtiger.com</a></td></tr>
</table></td></tr></table></body></html>`;

  return { subject: c.subject(kind), html, text };
}

/** 신청 직후 호출 — 실패해도 신청 처리에는 영향 없음 */
export async function sendConfirmation(r: Record_) {
  if (!r.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return;
  // 남의 주소를 적어 메일을 반복해 보내는 악용 방지: 같은 주소로 1시간에 3번 넘게 신청이 들어오면 회신 생략
  if (await tooMany(r.email)) return;
  const m = confirmationMail(r);
  await sendMail({ to: r.email, ...m });
}

async function tooMany(email: string) {
  try {
    const { url, headers } = cfg();
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const q = new URLSearchParams({ select: "id", email: `eq.${email}`, created_at: `gte.${since}`, limit: "10" });
    const res = await fetch(`${url}/rest/v1/applications?${q}`, { headers, cache: "no-store" });
    if (!res.ok) return false;
    const rows = (await res.json()) as unknown[];
    return rows.length > 3;
  } catch {
    return false;
  }
}
