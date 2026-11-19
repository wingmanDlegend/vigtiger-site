// 관리자 대시보드용 가벼운 차트 (서버에서 SVG/HTML로 그림, 움직이는 효과 없음)
// 색: 검증된 3색 (파랑·주황·청록). 글자는 색 대신 검정/회색, 각 막대에 마우스를 올리면 값이 보이고, '표로 보기'로 숫자 확인.
import type { ReactNode } from "react";

export const C = { blue: "#2a78d6", orange: "#eb6834", aqua: "#1baf7a", gray: "#b9b4ac" };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}
export const fmtNum = (n: number) => n.toLocaleString("ko-KR");
export function fmtWonShort(n: number) {
  const a = Math.abs(n);
  if (a >= 1e8) return `${(n / 1e8).toFixed(a >= 1e9 ? 0 : 1).replace(/\.0$/, "")}억`;
  if (a >= 1e4) return `${Math.round(n / 1e4).toLocaleString("ko-KR")}만`;
  return fmtNum(n);
}
export const fmtWon = (n: number) => `${fmtNum(n)}원`;

export function Kpi({ label, value, sub, delta, href, tone }: { label: string; value: string; sub?: string; delta?: number | null; href?: string; tone?: "warn" }) {
  const body = (
    <>
      <span className="db-kpi-label">{label}</span>
      <b className="db-kpi-value">{value}</b>
      {(sub || delta !== undefined) && (
        <span className="db-kpi-sub">
          {delta !== undefined && delta !== null && (
            <span className={delta > 0 ? "is-up" : delta < 0 ? "is-down" : ""}>
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "–"} {Math.abs(delta)}%
            </span>
          )}
          {delta === null && <span>이전 기간 비교 없음</span>}
          {sub && <span>{sub}</span>}
        </span>
      )}
    </>
  );
  const cls = `a-card db-kpi ${tone === "warn" ? "is-warn" : ""}`;
  return href ? (
    <a className={cls} href={href}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function ChartCard({ title, note, table, children, wide }: { title: string; note?: string; table?: { head: string[]; rows: (string | number)[][] }; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`a-card db-card ${wide ? "is-wide" : ""}`}>
      <h2>{title}</h2>
      {note && <p className="a-sub">{note}</p>}
      <div className="db-plot">{children}</div>
      {table && table.rows.length > 0 && (
        <details className="db-table">
          <summary>표로 보기</summary>
          <table>
            <thead>
              <tr>
                {table.head.map((h) => (
                  <th key={h} scope="col">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </section>
  );
}

export function Empty({ children = "아직 데이터가 없어요." }: { children?: ReactNode }) {
  return <p className="db-empty">{children}</p>;
}

type Series = { key: string; label: string; color: string };

/** 세로 막대 (한 계열 또는 누적). 값 라벨은 가장 큰 막대와 마지막 막대에만 */
export function Columns({
  data,
  series,
  format = fmtNum,
  height = 200,
  wide = false,
}: {
  data: { label: string; values: Record<string, number> }[];
  series: Series[];
  format?: (n: number) => string;
  height?: number;
  wide?: boolean;
}) {
  const totals = data.map((d) => series.reduce((s, x) => s + (d.values[x.key] ?? 0), 0));
  const max = niceMax(Math.max(0, ...totals));
  if (totals.every((t) => t === 0)) return <Empty />;
  const W = wide ? 1240 : 640, // 넓은 카드는 가로 좌표를 늘려 글자 크기를 그대로 유지
    H = height,
    padL = 58,
    padB = 24,
    padT = 18;
  const plotW = W - padL - 8,
    plotH = H - padB - padT;
  const slot = plotW / data.length;
  const bw = Math.min(36, slot * 0.62);
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const maxIdx = totals.indexOf(Math.max(...totals));
  const last = totals.length - 1;
  return (
    <>
      {series.length > 1 && (
        <ul className="db-legend">
          {series.map((s) => (
            <li key={s.key}>
              <i style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="db-svg" role="img" aria-label="막대 차트">
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - 8} y1={y(max * t)} y2={y(max * t)} stroke="#ece8e2" strokeWidth={1} />
            <text x={padL - 8} y={y(max * t) + 4} textAnchor="end" className="db-axis">
              {format(max * t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = padL + slot * i + slot / 2;
          let acc = 0;
          const segs = series
            .map((s) => ({ s, v: d.values[s.key] ?? 0 }))
            .filter((x) => x.v > 0);
          return (
            <g key={d.label}>
              {segs.map(({ s, v }, j) => {
                const top = y(acc + v);
                const bottom = y(acc);
                acc += v;
                const isTop = j === segs.length - 1;
                const h = Math.max(0, bottom - top - (j > 0 ? 2 : 0)); // 2px 간격
                const yy = top;
                const r = isTop ? Math.min(4, h) : 0;
                const x0 = cx - bw / 2;
                const path = `M${x0},${yy + h} V${yy + r} Q${x0},${yy} ${x0 + r},${yy} H${x0 + bw - r} Q${x0 + bw},${yy} ${x0 + bw},${yy + r} V${yy + h} Z`;
                return (
                  <path key={s.key} d={path} fill={s.color}>
                    <title>{`${d.label} · ${s.label}: ${format(v)}`}</title>
                  </path>
                );
              })}
              {/* 마우스 영역(막대보다 넓게) */}
              <rect x={cx - slot / 2} y={padT} width={slot} height={plotH} fill="transparent">
                <title>{`${d.label}: ${series.length > 1 ? series.map((s) => `${s.label} ${format(d.values[s.key] ?? 0)}`).join(" · ") + ` (합계 ${format(totals[i])})` : format(totals[i])}`}</title>
              </rect>
              {(i === maxIdx || i === last) && totals[i] > 0 && (
                <text x={cx} y={y(totals[i]) - 6} textAnchor="middle" className="db-val">
                  {format(totals[i])}
                </text>
              )}
              <text x={cx} y={H - 6} textAnchor="middle" className="db-axis">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
}

/** 가로 막대 목록 — 값과 비율을 글자로 함께 표시 */
export function HBars({
  rows,
  color = C.blue,
  format = fmtNum,
  showShare = true,
  max: maxRows = 10,
}: {
  rows: { label: string; value: number; href?: string; sub?: string }[];
  color?: string;
  format?: (n: number) => string;
  showShare?: boolean;
  max?: number;
}) {
  const shown = rows.filter((r) => r.value > 0).slice(0, maxRows);
  if (shown.length === 0) return <Empty />;
  const total = rows.reduce((s, r) => s + Math.max(0, r.value), 0);
  const top = Math.max(...shown.map((r) => r.value));
  return (
    <ul className="db-hbars">
      {shown.map((r) => (
        <li key={r.label} title={`${r.label}: ${format(r.value)}${showShare && total ? ` (${Math.round((r.value / total) * 100)}%)` : ""}`}>
          <span className="db-hb-label">
            {r.href ? <a href={r.href}>{r.label}</a> : r.label}
            {r.sub && <small>{r.sub}</small>}
          </span>
          <span className="db-hb-track">
            <i style={{ width: `${Math.max(2, (r.value / top) * 100)}%`, background: color }} />
          </span>
          <span className="db-hb-val">
            {format(r.value)}
            {showShare && total > 0 && <small>{Math.round((r.value / total) * 100)}%</small>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** 100% 나눔 막대 + 범례(값·비율) */
export function Split({ parts, format = fmtNum }: { parts: { label: string; value: number; color: string }[]; format?: (n: number) => string }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total === 0) return <Empty />;
  return (
    <div className="db-split">
      <div className="db-split-bar">
        {parts
          .filter((p) => p.value > 0)
          .map((p) => (
            <i key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label}: ${format(p.value)} (${Math.round((p.value / total) * 100)}%)`} />
          ))}
      </div>
      <ul className="db-legend is-values">
        {parts.map((p) => (
          <li key={p.label}>
            <i style={{ background: p.color }} />
            {p.label} <b>{format(p.value)}</b> <small>{Math.round((p.value / total) * 100)}%</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 단계별 깔때기 — 첫 단계 대비 비율 */
export function Funnel({ steps, color = C.blue }: { steps: { label: string; value: number; note?: string }[]; color?: string }) {
  const first = steps[0]?.value ?? 0;
  if (!first) return <Empty />;
  return (
    <ol className="db-funnel">
      {steps.map((s, i) => (
        <li key={s.label} title={`${s.label}: ${fmtNum(s.value)}건 (${Math.round((s.value / first) * 100)}%)`}>
          <span className="db-hb-label">
            {s.label}
            {s.note && <small>{s.note}</small>}
          </span>
          <span className="db-hb-track">
            <i style={{ width: `${Math.max(2, (s.value / first) * 100)}%`, background: color, opacity: 1 - i * 0.18 }} />
          </span>
          <span className="db-hb-val">
            {fmtNum(s.value)}건<small>{Math.round((s.value / first) * 100)}%</small>
          </span>
        </li>
      ))}
    </ol>
  );
}
