"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PartnerUser } from "@/lib/partners/model";
import { createAccountAction, deleteAccountAction, resetPasswordAction, setAccountActiveAction } from "./actions";

const SITE = "https://partners.vigtiger.com";
const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "–");

type Issued = { email: string; name: string; password: string };

function IssuedBox({ it, brandName, onClose }: { it: Issued; brandName?: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = `[대범한사람들 TO 파트너스] ${brandName ? `${brandName} ` : ""}담당자 계정 안내

${it.name}님, 티오(TO) 제품 관리 사이트 계정을 보내 드려요.
· 주소: ${SITE}
· 아이디(이메일): ${it.email}
· 임시 비밀번호: ${it.password}

처음 로그인하면 새 비밀번호를 정하는 화면이 나와요.`;
  return (
    <div className="p-issued" role="status">
      <p><b>임시 비밀번호는 지금 한 번만 보여요.</b> 아래 안내문을 복사해서 담당자에게 카카오톡·문자 등으로 전달해 주세요. (이메일과 비밀번호는 따로 보내는 걸 권해요)</p>
      <pre className="p-issued-text">{text}</pre>
      <div className="a-row">
        <button
          type="button"
          className="a-btn"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "복사했어요" : "안내문 복사"}
        </button>
        <button type="button" className="a-btn is-ghost" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export default function AccountsPanel({ role, brandId, brandName, users }: { role: "admin" | "brand"; brandId?: string; brandName?: string; users: PartnerUser[] }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [open, setOpen] = useState(users.length === 0);
  const [issued, setIssued] = useState<Issued | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [asking, setAsking] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const run = (fn: () => Promise<{ ok: boolean; message: string; password?: string }>, who?: { email: string; name: string }) =>
    start(async () => {
      const r = await fn();
      setMsg({ ok: r.ok, message: r.message });
      if (r.ok && r.password && who) setIssued({ ...who, password: r.password });
      setAsking(null);
      router.refresh();
    });

  const now = Date.now();
  return (
    <section className="a-card a-sec" aria-label={role === "admin" ? "관리자 계정" : "담당자 계정"}>
      <div className="a-head-row">
        <h2>{role === "admin" ? "관리자 계정" : "담당자 계정"}</h2>
        {!open && <button type="button" className="a-btn is-ghost" onClick={() => setOpen(true)}>+ 계정 발급</button>}
      </div>
      {issued && <IssuedBox it={issued} brandName={brandName} onClose={() => setIssued(null)} />}
      {msg && !issued && <p className={msg.ok ? "a-saved" : "a-error"} role="status">{msg.message}</p>}

      {users.length > 0 && (
        <div className="a-table-box">
          <table className="a-table">
            <thead>
              <tr>
                <th scope="col">담당자</th>
                <th scope="col">상태</th>
                <th scope="col">마지막 로그인</th>
                <th scope="col"><span className="sr-only">작업</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const locked = u.locked_until && new Date(u.locked_until).getTime() > now;
                return (
                  <tr key={u.id}>
                    <td>
                      <b>{u.name}</b>
                      <div className="a-sub">{u.email}{u.phone ? ` · ${u.phone}` : ""}</div>
                    </td>
                    <td className="a-nowrap">
                      {!u.active ? <span className="p-tag is-del">사용 중지</span> : locked ? <span className="p-tag is-del">잠김</span> : u.must_change_password ? <span className="p-tag is-edit">첫 로그인 전</span> : <span className="p-tag is-ok">사용 중</span>}
                    </td>
                    <td className="a-nowrap a-sub">{fmt(u.last_login_at)}</td>
                    <td>
                      {asking === u.id ? (
                        <span className="p-confirm">
                          <span>{u.email} 계정을 삭제할까요?</span>
                          <button type="button" className="a-btn is-danger p-sm" disabled={pending} onClick={() => run(() => deleteAccountAction(u.id))}>삭제</button>
                          <button type="button" className="a-btn is-ghost p-sm" onClick={() => setAsking(null)}>아니요</button>
                        </span>
                      ) : (
                        <span className="p-actions">
                          <button type="button" className="a-btn is-ghost p-sm" disabled={pending} onClick={() => run(() => resetPasswordAction(u.id), u)}>임시 비밀번호 재발급</button>
                          <button type="button" className="a-btn is-ghost p-sm" disabled={pending} onClick={() => run(() => setAccountActiveAction(u.id, !u.active))}>{u.active ? "사용 중지" : "다시 사용"}</button>
                          <button type="button" className="a-btn is-danger-ghost p-sm" onClick={() => setAsking(u.id)}>삭제</button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <form
          className="p-issue"
          onSubmit={(e) => {
            e.preventDefault();
            const who = { email: form.email.trim().toLowerCase(), name: form.name.trim() };
            start(async () => {
              const r = await createAccountAction({ role, brand_id: brandId, ...form });
              setMsg({ ok: r.ok, message: r.message });
              if (r.ok && r.password) {
                setIssued({ ...who, password: r.password });
                setForm({ name: "", email: "", phone: "" });
                setOpen(false);
              }
              router.refresh();
            });
          }}
        >
          <p className="a-label">{role === "admin" ? "새 관리자 계정" : `${brandName ?? ""} 담당자 계정 발급`}</p>
          <div className="gb-grid">
            <div className="gb-field">
              <label className="a-label" htmlFor={`ac-name-${role}`}>이름</label>
              <input id={`ac-name-${role}`} className="a-input" value={form.name} maxLength={60} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor={`ac-email-${role}`}>이메일 (아이디)</label>
              <input id={`ac-email-${role}`} className="a-input" type="email" value={form.email} maxLength={200} required onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor={`ac-phone-${role}`}>연락처 (선택)</label>
              <input id={`ac-phone-${role}`} className="a-input" value={form.phone} maxLength={30} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="a-row">
            <button type="submit" className="a-btn" disabled={pending}>{pending ? "만드는 중…" : "계정 만들고 임시 비밀번호 받기"}</button>
            {users.length > 0 && <button type="button" className="a-btn is-ghost" onClick={() => setOpen(false)}>취소</button>}
          </div>
        </form>
      )}
    </section>
  );
}
