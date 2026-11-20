import "server-only";
import { randomBytes } from "node:crypto";
import { cfg } from "@/lib/admin/db";

// 제품·브랜드 이미지 업로드 → Supabase Storage 'partners' 버킷 (공개 읽기)

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/** 파일 앞부분으로 실제 형식 확인 (확장자·MIME만 믿지 않음) */
function sniff(b: Uint8Array) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export async function uploadImage(file: File, folder: "products" | "brands") {
  if (!(file instanceof File) || file.size === 0) throw new Error("이미지 파일을 골라 주세요.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("이미지는 3MB 이하로 올려 주세요.");
  const buf = new Uint8Array(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type) throw new Error("JPG, PNG, WEBP 이미지만 올릴 수 있어요.");
  const { url, headers } = cfg();
  const d = new Date().toISOString().slice(0, 7);
  const path = `${folder}/${d}/${randomBytes(12).toString("hex")}.${TYPES[type]}`;
  const res = await fetch(`${url}/storage/v1/object/partners/${path}`, {
    method: "POST",
    headers: { apikey: headers.apikey, Authorization: headers.Authorization, "Content-Type": type, "Cache-Control": "31536000", "x-upsert": "false" },
    body: buf,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`이미지 업로드 실패 (${res.status})`);
  return `${url}/storage/v1/object/public/partners/${path}`;
}

// ---------- 슬랙 알림 (SLACK_WEBHOOK_URL) ----------
const ADMIN_URL = process.env.ADMIN_URL || "https://admin.vigtiger.com";

export async function notifyPartners(text: string, path = "/to/review") {
  const hook = process.env.SLACK_WEBHOOK_URL;
  const local = process.env.ALLOW_LOCAL_WEBHOOK === "1" && hook?.startsWith("http://127.0.0.1"); // 로컬 테스트 전용
  if (!hook || !(/^https:\/\/hooks\.slack\.com\//.test(hook) || local)) return;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        blocks: [
          { type: "section", text: { type: "mrkdwn", text: `🧾 *티오 파트너스* — ${esc(text)}` } },
          { type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "승인 대기 보기" }, url: `${ADMIN_URL}${path}` }] },
        ],
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("partners slack", err);
  }
}
