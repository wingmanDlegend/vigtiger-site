"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null as null | { error: string });
  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label className="a-label" htmlFor="pw">
        관리자 비밀번호
      </label>
      <input id="pw" name="password" type="password" className="a-input" required autoComplete="current-password" autoFocus />
      {state?.error && (
        <p className="a-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="a-btn" type="submit" disabled={pending} style={{ justifyContent: "center" }}>
        {pending ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
