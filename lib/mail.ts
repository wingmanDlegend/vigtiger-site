import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

// 구글 워크스페이스(Gmail) 계정으로 메일 보내기 — 앱 비밀번호 사용
// 환경변수 (Vercel, Sensitive):
//   GMAIL_USER          보내는 구글 계정 (cs@vigtiger.com)
//   GMAIL_APP_PASSWORD  그 계정의 앱 비밀번호 16자리
//   MAIL_FROM           (선택) 보낸 사람 표시, 기본 "대범한사람들 <no-reply@vigtiger.com>"
//                       no-reply@는 cs@ 계정의 별칭('다른 주소에서 메일 보내기' 등록) → 신청자가 답장하면 cs@ 받은편지함으로 들어감
//   MAIL_REPLY_TO       (선택) 따로 답장 주소를 지정할 때만. 기본은 넣지 않음
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
      from: process.env.MAIL_FROM || "대범한사람들 <no-reply@vigtiger.com>",
      ...(process.env.MAIL_REPLY_TO ? { replyTo: process.env.MAIL_REPLY_TO } : {}),
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
