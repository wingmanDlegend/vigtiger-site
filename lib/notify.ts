import "server-only";
import type { Application } from "@/lib/admin/db";
import { TYPE_LABEL, detailRows } from "@/lib/admin/format";
import { SITE_URL } from "@/lib/site";

// 새 신청을 슬랙 채널로 알립니다. (Vercel 환경변수 SLACK_WEBHOOK_URL)
// 알림이 실패해도 신청 접수에는 영향을 주지 않습니다.

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

const EMOJI: Record<Application["type"], string> = { creator: "🎬", advertiser: "📢", partner: "📦" };

export async function notifySlack(a: Omit<Application, "updated_at" | "admin_note" | "status">) {
  const url = process.env.SLACK_WEBHOOK_URL;
  const local = process.env.ALLOW_LOCAL_WEBHOOK === "1" && url?.startsWith("http://127.0.0.1"); // 로컬 테스트 전용
  if (!url || !(/^https:\/\/hooks\.slack\.com\//.test(url) || local)) return;

  const typeLabel = TYPE_LABEL[a.type];
  const title = `${EMOJI[a.type]} 새 ${typeLabel} 신청 · ${a.name}${a.company ? ` (${a.company})` : ""}`;
  const details = detailRows(a as Application)
    .filter((r) => r.value)
    .map((r) => `*${esc(r.label)}*  ${esc(clip(r.value, 200))}`)
    .join("\n");
  const adminUrl = `${SITE_URL}/admin/${a.id}`;

  const payload = {
    text: title, // 알림 미리보기용
    blocks: [
      { type: "header", text: { type: "plain_text", text: clip(title, 150), emoji: true } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*연락처*\n${esc(a.phone ?? "-")}` },
          { type: "mrkdwn", text: `*이메일*\n${esc(a.email)}` },
          { type: "mrkdwn", text: `*회사·채널*\n${esc(a.company ?? "-")}` },
          { type: "mrkdwn", text: `*신청 페이지*\n${a.lang === "en" ? "영문" : "한국어"}` },
        ],
      },
      ...(details ? [{ type: "section", text: { type: "mrkdwn", text: clip(details, 2900) } }] : []),
      ...(a.message
        ? [{ type: "section", text: { type: "mrkdwn", text: `*메시지*\n>${esc(clip(a.message, 1200)).replace(/\n/g, "\n>")}` } }]
        : []),
      {
        type: "actions",
        elements: [{ type: "button", text: { type: "plain_text", text: "관리자 페이지에서 보기" }, url: adminUrl, style: "primary" }],
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("Slack notify failed", res.status, await res.text().catch(() => ""));
  } catch (err) {
    console.error("Slack notify error", err);
  }
}
