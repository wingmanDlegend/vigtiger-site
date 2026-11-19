"use client";

import { useActionState } from "react";
import { changePasswordAction } from "../actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, null);
  return (
    <form action={action} className="p-form">
      <label className="a-label" htmlFor="cur">지금 비밀번호 (임시 비밀번호)</label>
      <input id="cur" name="current" type="password" className="a-input p-wide" autoComplete="current-password" required />
      <label className="a-label" htmlFor="next">새 비밀번호</label>
      <input id="next" name="next" type="password" className="a-input p-wide" autoComplete="new-password" minLength={10} required aria-describedby="pw-rule" />
      <p id="pw-rule" className="a-sub">10자 이상, 영문과 숫자를 함께 넣어 주세요.</p>
      <label className="a-label" htmlFor="again">새 비밀번호 확인</label>
      <input id="again" name="again" type="password" className="a-input p-wide" autoComplete="new-password" minLength={10} required />
      {state?.message && <p className="a-error" role="alert">{state.message}</p>}
      <button className="a-btn p-wide" type="submit" disabled={pending}>{pending ? "저장 중…" : "비밀번호 바꾸기"}</button>
    </form>
  );
}
