"use server";

import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { FORMS, LIMITS } from "@/lib/forms";
import { notifySlack } from "@/lib/notify";
import { getToCatalog } from "@/lib/tosite/data";

// to.vigtiger.com 상담신청 — 홈페이지 신청서와 같은 applications 테이블(type='to')에 저장해
// admin.vigtiger.com '제휴 신청'에서 함께 관리합니다.
// 브랜드·제품은 화면에서 ID로 받고, 서버에서 실제 게시 중인 브랜드·제품인지 확인한 뒤 이름으로 바꿔 저장합니다.

export type ToApplyInput = {
  name: string;
  email: string;
  phone: string;
  message?: string;
  privacyAgreed: boolean;
  website?: string;
  details: Record<string, string | string[]>;
};
export type ToApplyResult = { ok: true } | { ok: false; error: "invalid" | "server"; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function submitToApply(input: ToApplyInput): Promise<ToApplyResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY 환경변수가 없습니다.");
    return { ok: false, error: "server" };
  }
  if (!input || typeof input !== "object") return { ok: false, error: "invalid" };
  // 숨김 필드가 채워져 있으면 봇으로 보고 조용히 성공 처리
  if (str(input.website, 200)) return { ok: true };

  const name = str(input.name, 100);
  const email = str(input.email, LIMITS.short);
  const phone = str(input.phone, 50);
  const message = str(input.message, LIMITS.message);
  const digits = phone.replace(/\D/g, "");
  if (!name || !EMAIL_RE.test(email) || digits.length < 8 || digits.length > 15 || input.privacyAgreed !== true) {
    return { ok: false, error: "invalid" };
  }

  const raw = (input.details ?? {}) as Record<string, unknown>;
  let catalog: Awaited<ReturnType<typeof getToCatalog>>;
  try {
    catalog = await getToCatalog();
  } catch (e) {
    console.error("TO catalog unavailable", e);
    return { ok: false, error: "server" };
  }

  // 브랜드·제품 1~2곳 (2곳째는 선택)
  const pick = (n: 1 | 2) => {
    const brandId = str(raw[`brand${n}`], 40);
    const productId = str(raw[`product${n}`], 40);
    const brand = UUID_RE.test(brandId) ? catalog.brandById.get(brandId) : undefined;
    if (!brand) return null;
    if (!productId) return { brand, product: null };
    const product = UUID_RE.test(productId) ? catalog.products.find((p) => p.id === productId && p.brand_id === brand.id) : undefined;
    return product ? { brand, product } : null;
  };
  // 1곳은 필수, 2곳째는 선택. 같은 브랜드를 두 번 고르면 서로 다른 제품이어야 함
  const c1 = pick(1);
  const hasSecond = !!str(raw.brand2, 40);
  const c2 = hasSecond ? pick(2) : null;
  if (!c1) return { ok: false, error: "invalid", message: "써보고 싶은 브랜드를 1곳 이상 골라 주세요." };
  if (hasSecond && !c2) return { ok: false, error: "invalid", message: "두 번째로 고른 브랜드·제품을 다시 확인해 주세요." };
  if (c2 && c1.brand.id === c2.brand.id && (!c1.product || !c2.product || c1.product.id === c2.product.id)) {
    return { ok: false, error: "invalid", message: "같은 브랜드를 두 번 고르려면 서로 다른 제품을 골라 주세요." };
  }

  const label = (p: { serial: string | null; name: string } | null) => (p ? `${p.serial ? `${p.serial} · ` : ""}${p.name}` : "");
  const details: Record<string, string | string[]> = {};
  for (const f of FORMS.to.fields) {
    if (f.key === "brand1") details.brand1 = c1.brand.name_ko;
    else if (f.key === "brand2") details.brand2 = c2 ? c2.brand.name_ko : "";
    else if (f.key === "product1") details.product1 = label(c1.product);
    else if (f.key === "product2") details.product2 = c2 ? label(c2.product) : "";
    else if (f.kind === "checkboxes") {
      const allowed = f.options?.map((o) => o.value) ?? [];
      const vals = Array.isArray(raw[f.key]) ? (raw[f.key] as unknown[]) : [];
      const picked = vals.filter((v): v is string => typeof v === "string" && allowed.includes(v));
      if (f.required && picked.length === 0) return { ok: false, error: "invalid" };
      details[f.key] = Array.from(new Set(picked));
    } else {
      const v = str(raw[f.key], LIMITS.short);
      const allowed = f.options?.map((o) => o.value);
      if (allowed && v && !allowed.includes(v)) return { ok: false, error: "invalid" };
      if (f.kind === "url" && v && !/^https?:\/\//i.test(v)) return { ok: false, error: "invalid" };
      if (f.required && !v) return { ok: false, error: "invalid" };
      details[f.key] = v;
    }
  }
  // 나중에 제품과 연결할 수 있도록 ID도 함께 남깁니다 (관리자 화면에는 이름이 보임)
  details.brand1_id = c1.brand.id;
  if (c2) details.brand2_id = c2.brand.id;
  if (c1.product) details.product1_id = c1.product.id;
  if (c2?.product) details.product2_id = c2.product.id;

  const record = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    type: "to" as const,
    lang: "ko" as const,
    name,
    company: (details.channelName as string) || null,
    email,
    phone,
    message: message || null,
    details,
    privacy_agreed: true,
  };

  try {
    const res = await fetch(`${url}/rest/v1/applications`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(record),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Supabase insert failed", res.status, await res.text().catch(() => ""));
      return { ok: false, error: "server" };
    }
  } catch (err) {
    console.error("Supabase unreachable", err);
    return { ok: false, error: "server" };
  }

  after(() => notifySlack(record));
  return { ok: true };
}
