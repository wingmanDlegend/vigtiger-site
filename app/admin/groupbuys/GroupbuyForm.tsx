"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FIELDS,
  GROUPS,
  PLATFORMS,
  RERUN_LABEL,
  STATUS_LABEL,
  cleanGroupbuy,
  num,
  type GBInput,
  type GroupBuy,
} from "@/lib/groupbuy";
import { createGroupbuy, removeGroupbuy, saveGroupbuy } from "./actions";

type Values = Record<keyof GBInput, string>;

function initial(g?: GroupBuy): Values {
  const v = {} as Values;
  for (const f of FIELDS) {
    const x = g?.[f.key];
    v[f.key] = f.kind === "bool" ? (x ? "true" : "") : x === null || x === undefined ? "" : String(x);
  }
  if (!g) v.status = "done";
  return v;
}

const n = (s: string) => {
  const t = s.replace(/[,\s원%]/g, "");
  return t === "" || isNaN(Number(t)) ? null : Number(t);
};

export default function GroupbuyForm({ item }: { item?: GroupBuy }) {
  const router = useRouter();
  const [v, setV] = useState<Values>(() => initial(item));
  const [msg, setMsg] = useState<{ ok: boolean; message: string; errors?: string[] } | null>(null);
  const [asking, setAsking] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof GBInput, val: string) => setV((p) => ({ ...p, [k]: val }));

  // 자동 계산 안내
  const calc = useMemo(() => {
    const list = n(v.list_price), deal = n(v.deal_price), units = n(v.units), rev = n(v.revenue);
    const rate = n(v.commission_rate), clicks = n(v.clicks);
    const revenue = deal !== null && units !== null ? deal * units : null;
    const base = rev ?? revenue;
    return {
      revenue,
      discount: list && deal !== null ? Math.round((1 - deal / list) * 1000) / 10 : null,
      payout: base !== null && rate !== null ? Math.round((base * rate) / 100) : null,
      conversion: clicks && units !== null ? Math.round((units / clicks) * 1000) / 10 : null,
    };
  }, [v]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const raw = { ...v, settled: v.settled === "true" } as Record<string, unknown>;
    const pre = cleanGroupbuy(raw);
    if (pre.errors.length) {
      setMsg({ ok: false, message: "입력 내용을 확인해 주세요.", errors: pre.errors });
      return;
    }
    setMsg(null);
    start(async () => {
      const r = item ? await saveGroupbuy(item.id, raw) : await createGroupbuy(raw);
      if (r.ok && !item && r.id) {
        router.push(`/admin/groupbuys?saved=${encodeURIComponent("새 공동구매 결과를 저장했습니다.")}`);
        return;
      }
      setMsg(r);
    });
  }

  const input = (k: keyof GBInput) => {
    const f = FIELDS.find((x) => x.key === k)!;
    const id = `gb-${k}`;
    const label = (
      <label className="a-label" htmlFor={id}>
        {f.label}
        {f.required && <span className="gb-req"> *</span>}
      </label>
    );
    let control: React.ReactNode;
    if (f.kind === "status") {
      control = (
        <select id={id} className="a-select" value={v[k]} onChange={(e) => set(k, e.target.value)}>
          {Object.entries(STATUS_LABEL).map(([val, l]) => (
            <option key={val} value={val}>{l}</option>
          ))}
        </select>
      );
    } else if (f.kind === "rerun") {
      control = (
        <select id={id} className="a-select" value={v[k]} onChange={(e) => set(k, e.target.value)}>
          <option value="">아직 판단 안 함</option>
          {Object.entries(RERUN_LABEL).map(([val, l]) => (
            <option key={val} value={val}>{l}</option>
          ))}
        </select>
      );
    } else if (f.kind === "bool") {
      return (
        <label className="gb-check gb-field" key={k}>
          <input type="checkbox" checked={v[k] === "true"} onChange={(e) => set(k, e.target.checked ? "true" : "")} /> {f.label}
        </label>
      );
    } else if (f.kind === "longtext") {
      control = <textarea id={id} className="a-textarea" value={v[k]} maxLength={f.max} onChange={(e) => set(k, e.target.value)} />;
    } else if (k === "platform") {
      control = (
        <>
          <input id={id} className="a-input" list="gb-platforms" value={v[k]} maxLength={40} onChange={(e) => set(k, e.target.value)} placeholder="YouTube, Instagram …" />
          <datalist id="gb-platforms">
            {PLATFORMS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </>
      );
    } else {
      const isNum = f.kind === "money" || f.kind === "int" || f.kind === "pct";
      control = (
        <input
          id={id}
          className="a-input"
          type={f.kind === "date" ? "date" : f.kind === "url" ? "url" : "text"}
          inputMode={isNum ? "decimal" : undefined}
          value={v[k]}
          maxLength={f.max}
          required={f.required}
          onChange={(e) => set(k, e.target.value)}
          placeholder={f.kind === "money" ? "원" : f.kind === "pct" ? "%" : f.kind === "url" ? "https://" : undefined}
        />
      );
    }
    return (
      <div className={`gb-field ${f.kind === "longtext" ? "is-wide" : ""}`} key={k}>
        {label}
        {control}
        {k === "deal_price" && calc.discount !== null && <span className="a-sub">할인율 {calc.discount}%</span>}
        {k === "revenue" && calc.revenue !== null && n(v.revenue) !== calc.revenue && (
          <button type="button" className="gb-hint" onClick={() => set("revenue", String(calc.revenue))}>
            공구가 × 수량 = {num(calc.revenue)}원 넣기
          </button>
        )}
        {k === "creator_payout" && calc.payout !== null && n(v.creator_payout) !== calc.payout && (
          <button type="button" className="gb-hint" onClick={() => set("creator_payout", String(calc.payout))}>
            매출 × 수수료율 = {num(calc.payout)}원 넣기
          </button>
        )}
        {k === "clicks" && calc.conversion !== null && <span className="a-sub">전환율(판매÷클릭) {calc.conversion}%</span>}
      </div>
    );
  };

  return (
    <form onSubmit={submit} className="gb-form" noValidate>
      {GROUPS.map((g) => (
        <section key={g.key} className="a-card a-sec">
          <h2>{g.label}</h2>
          {g.key === "sales" && <p className="a-sub">총 매출을 비워 두면 공구가 × 판매 수량으로 저장돼요.</p>}
          {g.key === "settle" && <p className="a-sub">크리에이터 정산액을 비워 두면 총 매출 × 수수료율로 저장돼요.</p>}
          <div className="gb-grid">{FIELDS.filter((f) => f.group === g.key).map((f) => input(f.key))}</div>
        </section>
      ))}

      <div className="gb-actions">
        <button type="submit" className="a-btn" disabled={pending}>
          {pending ? "저장 중…" : item ? "저장" : "저장하기"}
        </button>
        <a className="a-btn is-ghost" href="/admin/groupbuys">목록으로</a>
        {msg && (
          <div className={msg.ok ? "a-saved" : "a-error"} role="status">
            {msg.message}
            {msg.errors && (
              <ul>
                {msg.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {item && (
        <section className="a-card a-sec a-danger">
          <h2>기록 삭제</h2>
          {!asking ? (
            <button type="button" className="a-btn is-danger-ghost" onClick={() => setAsking(true)}>이 기록 삭제</button>
          ) : (
            <>
              <p className="a-confirm">
                <b>{item.brand} · {item.creator}</b> 공동구매 기록을 영구 삭제할까요? 삭제 후에는 복구할 수 없습니다.
              </p>
              <div className="a-row">
                <button
                  type="button"
                  className="a-btn is-danger"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await removeGroupbuy(item.id);
                      if (r && !r.ok) setMsg(r);
                    })
                  }
                >
                  영구 삭제
                </button>
                <button type="button" className="a-btn is-ghost" onClick={() => setAsking(false)}>취소</button>
              </div>
            </>
          )}
        </section>
      )}
    </form>
  );
}
