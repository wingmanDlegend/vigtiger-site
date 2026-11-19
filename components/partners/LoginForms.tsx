"use client";

import { useActionState, useState } from "react";
import { adminLoginAction, brandLoginAction, masterLoginAction } from "./actions";

/** site="partners": 브랜드 담당자 로그인 / site="admin": 직원 계정 + 대표 관리자 비밀번호 */
export default function LoginForms({ site }: { site: "partners" | "admin" }) {
  const [master, setMaster] = useState(false);
  const [state, login, pending] = useActionState(site === "admin" ? adminLoginAction : brandLoginAction, null);
  const [mstate, mlogin, mpending] = useActionState(masterLoginAction, null);

  if (site === "admin" && master) {
    return (
      <form action={mlogin} className="p-form">
        <p className="a-sub">대표 관리자는 관리자 비밀번호 하나로 들어와요.</p>
        <label className="a-label" htmlFor="m-pw">관리자 비밀번호</label>
        <input id="m-pw" name="password" type="password" className="a-input p-wide" autoComplete="current-password" required autoFocus />
        {mstate?.message && <p className="a-error" role="alert">{mstate.message}</p>}
        <button className="a-btn p-wide" type="submit" disabled={mpending}>{mpending ? "확인 중…" : "대표 관리자로 로그인"}</button>
        <button type="button" className="p-link" onClick={() => setMaster(false)}>← 직원 계정으로 로그인</button>
      </form>
    );
  }
  return (
    <form action={login} className="p-form">
      <label className="a-label" htmlFor="email">이메일</label>
      <input id="email" name="email" type="email" className="a-input p-wide" autoComplete="username" required autoFocus />
      <label className="a-label" htmlFor="pw">비밀번호</label>
      <input id="pw" name="password" type="password" className="a-input p-wide" autoComplete="current-password" required />
      {state?.message && <p className="a-error" role="alert">{state.message}</p>}
      <button className="a-btn p-wide" type="submit" disabled={pending}>{pending ? "확인 중…" : "로그인"}</button>
      {site === "admin" && (
        <button type="button" className="p-link" onClick={() => setMaster(true)}>대표 관리자 비밀번호로 로그인</button>
      )}
    </form>
  );
}
