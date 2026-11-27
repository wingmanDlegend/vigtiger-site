import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

// 구글 워크스페이스(Gmail) 계정으로 메일 보내기 — 앱 비밀번호 사용
// 환경변수 (Vercel, Sensitive):
//   GMAIL_USER          보내는 구글 계정 (예: vigtiger@vigtiger.com)
//   GMAIL_APP_PASSWORD  그 계정의 앱 비밀번호 16자리
//   MAIL_FROM           (선택) 보낸 사람 표시 — 예: "대범한사람들 <no-reply@vigtiger.com>"
//                       별칭 주소를 쓰려면 Gmail '다른 주소에서 메일 보내기'에 등록돼 있어야 해요
//   MAIL_REPLY_TO       (선택) 답장 받을 주소, 기본 vigtiger@vigtiger.com
// 설정이 없으면 아무것도 보내지 않고 조용히 넘어갑니다.

let cached: Transporter | null = null;

export function mailConfigured() {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function transporter() {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: process.env.GMAIL_USER, pass: (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s+/g, "") },
  });
  return cached;
}

export async function sendMail(m: { to: string; subject: string; html: string; text: string }) {
  if (!mailConfigured()) return { sent: false as const, reason: "not-configured" };
  try {
    await transporter().sendMail({
      from: process.env.MAIL_FROM || `대범한사람들 <${process.env.GMAIL_USER}>`,
      replyTo: process.env.MAIL_REPLY_TO || "vigtiger@vigtiger.com",
      to: m.to,
      subject: m.subject,
      html: m.html,
      text: m.text,
    });
    return { sent: true as const };
  } catch (e) {
    // 메일이 실패해도 신청 자체는 이미 저장됐으므로 기록만 남깁니다 (주소·비밀번호는 남기지 않음)
    console.error("confirmation mail failed:", e instanceof Error ? e.message : e);
    return { sent: false as const, reason: "error" };
  }
}
