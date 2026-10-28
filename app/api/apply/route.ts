import { NextResponse } from "next/server";
import { FORMS, FORM_TYPES, LIMITS, type FormType } from "@/lib/forms";

// 신청서 접수: 서버에서 항목을 검증한 뒤 Supabase applications 테이블에 저장합니다.
// 테이블은 RLS로 "등록(insert)만" 허용되어 있어, 공개 키로는 접수 내역을 읽을 수 없습니다.
// 접수 내역은 Supabase 대시보드 > Table Editor > applications 에서 확인하세요.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY 환경변수가 없습니다.");
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // 숨김 필드가 채워져 있으면 봇으로 보고 조용히 성공 처리
  if (str(body.website, 200)) return NextResponse.json({ ok: true });

  const type = body.type as FormType;
  if (!FORM_TYPES.includes(type)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const lang = body.lang === "en" ? "en" : "ko";

  const name = str(body.name, 100);
  const email = str(body.email, LIMITS.short);
  const phone = str(body.phone, 50);
  const message = str(body.message, LIMITS.message);
  const phoneDigits = phone.replace(/\D/g, "");
  if (!name || !EMAIL_RE.test(email) || phoneDigits.length < 8 || phoneDigits.length > 15 || body.privacyAgreed !== true) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // 정의된 항목만 받고, 선택지는 정의된 값만 허용
  const raw = (body.details ?? {}) as Record<string, unknown>;
  const details: Record<string, string | string[]> = {};
  for (const f of FORMS[type].fields) {
    const allowed = f.options?.map((o) => o.value);
    if (f.kind === "checkboxes") {
      const vals = Array.isArray(raw[f.key]) ? (raw[f.key] as unknown[]) : [];
      const picked = vals.filter((v): v is string => typeof v === "string" && !!allowed?.includes(v));
      if (f.required && picked.length === 0) return NextResponse.json({ error: "invalid" }, { status: 400 });
      details[f.key] = Array.from(new Set(picked));
    } else {
      const v = str(raw[f.key], LIMITS.short);
      if (allowed && v && !allowed.includes(v)) return NextResponse.json({ error: "invalid" }, { status: 400 });
      if (f.kind === "url" && v && !/^https?:\/\//i.test(v)) return NextResponse.json({ error: "invalid" }, { status: 400 });
      if (f.required && !v) return NextResponse.json({ error: "invalid" }, { status: 400 });
      details[f.key] = v;
    }
  }

  const company =
    str(raw.company, LIMITS.short) || str(raw.channelName, LIMITS.short) || str(raw.brand, LIMITS.short) || null;

  let res: Response;
  try {
    res = await fetch(`${url}/rest/v1/applications`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      type,
      lang,
      name,
      company,
      email,
      phone,
      message: message || null,
      details,
      privacy_agreed: true,
    }),
    cache: "no-store",
    });
  } catch (err) {
    console.error("Supabase unreachable", err);
    return NextResponse.json({ error: "server" }, { status: 502 });
  }

  if (!res.ok) {
    console.error("Supabase insert failed", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "server" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
