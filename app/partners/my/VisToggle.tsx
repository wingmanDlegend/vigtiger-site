"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setToVisibleAction } from "./actions";

// 제품별 TO 서비스 노출 스위치 — 누르면 바로 저장 (승인 없음)
export default function VisToggle({ id, name, on, withText = false }: { id: string; name: string; on: boolean; withText?: boolean }) {
  const [value, setValue] = useState(on);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <span className="p-vis-wrap">
      <label className="p-vis">
        <input
          type="checkbox"
          checked={value}
          disabled={pending}
          aria-label={`${name} TO 서비스 노출`}
          onChange={(e) => {
            const next = e.target.checked;
            setValue(next);
            start(async () => {
              const r = await setToVisibleAction(id, next);
              if (!r.ok) setValue(!next);
              setMsg(r.ok ? "" : r.message);
              router.refresh();
            });
          }}
        />
        <span className="p-vis-track" aria-hidden="true" />
        <span>{value ? "노출" : "숨김"}{withText ? (value ? " — 크리에이터에게 보여요" : " — 크리에이터에게 안 보여요") : ""}</span>
      </label>
      {msg && <span className="a-error" role="alert">{msg}</span>}
    </span>
  );
}
