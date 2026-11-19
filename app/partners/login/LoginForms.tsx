"use client";

import { useActionState, useState } from "react";
import { loginAction, masterLoginAction } from "../actions";

export default function LoginForms() {
  const [master, setMaster] = useState(false);
  const [state, login, pending] = useActionState(loginAction, null);
  const [mstate, mlogin, mpending] = useActionState(masterLoginAction, null);

  if (master) {
    return (
      <form action={mlogin} className="p-form">
        <p className="a-sub">대범한사람들 관리자 페이지(vigtiger.com/admin)와 같은 비밀번호로 들어가요.</p>
        <label className="a-label" htmlFor="m-pw">관리자 비밀번호</label>
        <input id="m-pw" name="password" type="password" className="a-input p-wide" autoComplete="current-password" required autoFocus />
        {mstate?.message && <p className="a-error" role="alert">{mstate.message}</p>}
        <button className="a-btn p-wide" type="submit" disabled={mpending}>{mpending ? "확인 중…" : "대표 관리자로 로그인"}</button>
        <button type="button" className="p-link" onClick={() => setMaster(false)}>← 파트너 계정으로 로그인</button>
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
      <button type="button" className="p-link" onClick={() => setMaster(true)}>대범한사람들 대표 관리자 로그인</button>
    </form>
  );
}
