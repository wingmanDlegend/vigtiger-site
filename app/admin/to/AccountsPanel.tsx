"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PartnerUser } from "@/lib/partners/model";
import { createAccountAction, deleteAccountAction, resetPasswordAction, setAccountActiveAction } from "./actions";

// 계정 관리 패널 — 두 가지로 씁니다.
//  role="brand": 브랜드 화면의 '브랜드 담당자 계정' (partners.vigtiger.com 에서 로그인)
//  role="admin": 설정의 '직원 계정' (admin.vigtiger.com 에서 로그인) — 대표 관리자만 관리

const SITE = { brand: "https://partners.vigtiger.com", admin: "https://admin.vigtiger.com" } as const;
const TEXT = {
  brand: {
    title: "브랜드 담당자 계정",
    where: "partners.vigtiger.com 에서 로그인해 자기 브랜드 제품을 등록·수정 요청해요.",
    add: "+ 담당자 계정 발급",
    formTitle: (brand?: string) => `${brand ?? ""} 담당자 계정 발급`,
    who: "담당자",
    empty: "아직 발급한 담당자 계정이 없어요.",
  },
  admin: {
    title: "직원 계정",
    where: "admin.vigtiger.com 업무 관리 시스템에 로그인하는 대범한사람들 직원 계정이에요.",
    add: "+ 직원 계정 발급",
    formTitle: () => "새 직원 계정",
    who: "직원",
    empty: "아직 발급한 직원 계정이 없어요. 대표 관리자는 계정 없이 관리자 비밀번호로 들어와요.",
  },
} as const;

const fmt = (s: string | null) => (s ? new Date(s).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "–");

type Issued = { email: string; name: string; password: string; kind: "new" | "reset" };

function message(role: "admin" | "brand", it: Issued, brandName?: string) {
  const reset = it.kind === "reset";
  if (role === "admin") {
    return `[대범한사람들 업무 관리] 직원 ${reset ? "비밀번호 재발급" : "계정"} 안내

${it.name}님, ${reset ? "업무 관리 시스템 임시 비밀번호를 새로 보내 드려요." : "대범한사람들 업무 관리 시스템 계정을 보내 드려요."}
· 주소: ${SITE.admin}
· 아이디(이메일): ${it.email}
· 임시 비밀번호: ${it.password}

로그인하면 새 비밀번호를 정하는 화면이 나와요.`;
  }
  return `[대범한사람들 TO 파트너스] ${brandName ? `${brandName} ` : ""}담당자 ${reset ? "비밀번호 재발급" : "계정"} 안내

${it.name}님, ${reset ? "티오(TO) 파트너스 임시 비밀번호를 새로 보내 드려요." : "티오(TO) 제품 관리 사이트 계정을 보내 드려요."}
· 주소: ${SITE.brand}
· 아이디(이메일): ${it.email}
· 임시 비밀번호: ${it.password}

로그인하면 새 비밀번호를 정하는 화면이 나와요.`;
}

function IssuedBox({ text, onClose }: { text: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="p-issued" role="status">
      <p>
        <b>임시 비밀번호는 지금 한 번만 보여요.</b> 아래 안내문을 복사해서 카카오톡·문자 등으로 전달해 주세요. (이메일과 비밀번호는 따로 보내는 걸 권해요)
      </p>
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

export default function AccountsPanel({
  role,
  brandId,
  brandName,
  users,
  canManage = true,
  meId,
}: {
  role: "admin" | "brand";
  brandId?: string;
  brandName?: string;
  users: PartnerUser[];
  /** 직원 계정은 대표 관리자만 관리 */
  canManage?: boolean;
  /** 지금 로그인한 직원 (자기 계정은 여기서 바꾸지 않음) */
  meId?: string | null;
}) {
  const T = TEXT[role];
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [open, setOpen] = useState(canManage && users.length === 0);
  const [issued, setIssued] = useState<Issued | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [asking, setAsking] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const run = (fn: () => Promise<{ ok: boolean; message: string; password?: string }>, who?: { email: string; name: string }) =>
    start(async () => {
      const r = await fn();
      setMsg({ ok: r.ok, message: r.message });
      if (r.ok && r.password && who) setIssued({ ...who, password: r.password, kind: "reset" });
      else setIssued(null);
      setAsking(null);
      router.refresh();
    });

  const now = Date.now();
  return (
    <section className="a-card a-sec" aria-label={T.title}>
      <div className="a-head-row">
        <div>
          <h2>{T.title}</h2>
          <p className="a-sub">{T.where}</p>
        </div>
        {canManage && !open && <button type="button" className="a-btn is-ghost" onClick={() => setOpen(true)}>{T.add}</button>}
      </div>
      {!canManage && <p className="a-note" role="note">직원 계정 발급·비밀번호 재발급·사용 중지·삭제는 대표 관리자만 할 수 있어요. 내 비밀번호는 위쪽 [비밀번호 변경]에서 바꿔요.</p>}
      {issued && <IssuedBox text={message(role, issued, brandName)} onClose={() => setIssued(null)} />}
      {msg && !issued && <p className={msg.ok ? "a-saved" : "a-error"} role="status">{msg.message}</p>}

      {users.length > 0 ? (
        <div className="a-table-box">
          <table className="a-table p-mini">
            <thead>
              <tr>
                <th scope="col">{T.who}</th>
                <th scope="col">상태</th>
                <th scope="col">마지막 로그인</th>
                {canManage && <th scope="col"><span className="sr-only">작업</span></th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const locked = u.locked_until && new Date(u.locked_until).getTime() > now;
                const me = meId && u.id === meId;
                return (
                  <tr key={u.id}>
                    <td>
                      <b>{u.name}</b> {me && <span className="p-tag is-ok">나</span>}
                      <div className="a-sub">{u.email}{u.phone ? ` · ${u.phone}` : ""}</div>
                    </td>
                    <td className="a-nowrap">
                      {!u.active ? <span className="p-tag is-del">사용 중지</span> : locked ? <span className="p-tag is-del">잠김 (5회 오류)</span> : u.must_change_password ? <span className="p-tag is-edit">첫 로그인 전</span> : <span className="p-tag is-ok">사용 중</span>}
                    </td>
                    <td className="a-nowrap a-sub">{fmt(u.last_login_at)}</td>
                    {canManage && (
                      <td>
                        {me ? (
                          <span className="a-sub">내 계정은 [비밀번호 변경]에서</span>
                        ) : asking === u.id ? (
                          <span className="p-confirm">
                            <span>{u.email} 계정을 삭제할까요? 되돌릴 수 없어요.</span>
                            <button type="button" className="a-btn is-danger p-sm" disabled={pending} onClick={() => run(() => deleteAccountAction(u.id))}>삭제</button>
                            <button type="button" className="a-btn is-ghost p-sm" onClick={() => setAsking(null)}>아니요</button>
                          </span>
                        ) : (
                          <span className="p-actions">
                            <button type="button" className="a-btn is-ghost p-sm" disabled={pending} onClick={() => run(() => resetPasswordAction(u.id), u)}>
                              {locked ? "잠금 풀고 임시 비밀번호 재발급" : "임시 비밀번호 재발급"}
                            </button>
                            <button type="button" className="a-btn is-ghost p-sm" disabled={pending} onClick={() => run(() => setAccountActiveAction(u.id, !u.active))}>{u.active ? "사용 중지" : "다시 사용"}</button>
                            <button type="button" className="a-btn is-danger-ghost p-sm" onClick={() => setAsking(u.id)}>삭제</button>
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !open && <p className="a-sub">{T.empty}</p>
      )}

      {canManage && open && (
        <form
          className="p-issue"
          onSubmit={(e) => {
            e.preventDefault();
            const who = { email: form.email.trim().toLowerCase(), name: form.name.trim() };
            start(async () => {
              const r = await createAccountAction({ role, brand_id: brandId, ...form });
              setMsg({ ok: r.ok, message: r.message });
              if (r.ok && r.password) {
                setIssued({ ...who, password: r.password, kind: "new" });
                setForm({ name: "", email: "", phone: "" });
                setOpen(false);
              }
              router.refresh();
            });
          }}
        >
          <p className="a-label">{T.formTitle(brandName)}</p>
          <div className="gb-grid">
            <div className="gb-field">
              <label className="a-label" htmlFor={`ac-name-${role}`}>{T.who} 이름</label>
              <input id={`ac-name-${role}`} className="a-input" value={form.name} maxLength={60} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="gb-field">
              <label className="a-label" htmlFor={`ac-email-${role}`}>이메일 (로그인 아이디)</label>
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
