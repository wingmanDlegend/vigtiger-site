"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FIELDS, STATUS_LABEL, cleanGroupbuy, matchHeader, num, type GBInput } from "@/lib/groupbuy";
import { importGroupbuys } from "../actions";

type Raw = Partial<Record<keyof GBInput, unknown>>;
type Parsed = { rows: Raw[]; mapped: { header: string; key: keyof GBInput | null }[] };

/** 따옴표를 지원하는 간단한 CSV 파서 */
function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      out.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    out.push(row);
  }
  return out;
}

async function readFile(file: File): Promise<unknown[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".txt")) {
    const buf = await file.arrayBuffer();
    let text = new TextDecoder("utf-8").decode(buf);
    // 깨진 글자가 많으면 엑셀 한글 기본 인코딩(EUC-KR)으로 다시 읽기
    if ((text.match(/�/g) ?? []).length > 3) text = new TextDecoder("euc-kr").decode(buf);
    return parseCsv(text.replace(/^﻿/, ""));
  }
  if (name.endsWith(".xlsx")) {
    const { readSheet } = await import("read-excel-file/browser");
    return (await readSheet(file)) as unknown[][];
  }
  throw new Error("엑셀(.xlsx) 또는 CSV 파일만 올릴 수 있어요. (.xls는 엑셀에서 .xlsx로 다시 저장해 주세요)");
}

function toParsed(table: unknown[][]): Parsed {
  const nonEmpty = table.filter((r) => r.some((c) => c !== null && c !== undefined && String(c).trim() !== ""));
  if (nonEmpty.length < 2) throw new Error("머리글 줄과 데이터 줄이 1개 이상 있어야 해요.");
  // 머리글: 처음 5줄 중 아는 항목이 가장 많이 맞는 줄
  let hi = 0;
  let best = -1;
  nonEmpty.slice(0, 5).forEach((r, i) => {
    const hits = r.filter((c) => matchHeader(String(c ?? ""))).length;
    if (hits > best) {
      best = hits;
      hi = i;
    }
  });
  const headers = nonEmpty[hi].map((c) => String(c ?? "").trim());
  const mapped = headers.map((h) => ({ header: h, key: matchHeader(h) }));
  const rows = nonEmpty.slice(hi + 1).map((r) => {
    const o: Raw = {};
    mapped.forEach((m, i) => {
      if (m.key && o[m.key] === undefined) o[m.key] = r[i] ?? "";
    });
    return o;
  });
  return { rows, mapped };
}

export default function ImportClient() {
  const router = useRouter();
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string; errors?: string[] } | null>(null);
  const [pending, start] = useTransition();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setParsed(null);
    setResult(null);
    setError("");
    if (!f) return;
    setFileName(f.name);
    try {
      setParsed(toParsed(await readFile(f)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "파일을 읽지 못했습니다.");
    }
  }

  const checked = parsed?.rows.map((r) => cleanGroupbuy(r)) ?? [];
  const bad = checked.filter((c) => c.errors.length).length;
  const missingRequired = parsed ? FIELDS.filter((f) => f.required && !parsed.mapped.some((m) => m.key === f.key)) : [];
  const unknown = parsed?.mapped.filter((m) => m.header && !m.key) ?? [];
  const canSave = parsed && checked.length > 0 && bad === 0 && missingRequired.length === 0;

  return (
    <div className="gb-import">
      <section className="a-card a-sec">
        <h2>파일 선택</h2>
        <input type="file" accept=".xlsx,.csv" onChange={onFile} aria-label="엑셀 또는 CSV 파일" />
        {error && <p className="a-error" role="alert">{error}</p>}
      </section>

      {parsed && (
        <>
          <section className="a-card a-sec">
            <h2>머리글 인식 결과 · {fileName}</h2>
            <div className="gb-map">
              {parsed.mapped.filter((m) => m.header).map((m, i) => (
                <span key={i} className={m.key ? "is-ok" : "is-skip"}>
                  {m.header} {m.key ? `→ ${FIELDS.find((f) => f.key === m.key)!.label}` : "(사용 안 함)"}
                </span>
              ))}
            </div>
            {missingRequired.length > 0 && (
              <p className="a-error" role="alert">
                필수 항목 머리글을 찾지 못했어요: {missingRequired.map((f) => f.label).join(", ")}. 엑셀 첫 줄의 이름을 양식과 같게 바꿔 주세요.
              </p>
            )}
            {unknown.length > 0 && <p className="a-sub">회색 항목은 알 수 없는 머리글이라 저장하지 않아요. 필요하면 양식의 이름으로 바꿔 주세요.</p>}
          </section>

          <section className="a-card a-sec">
            <h2>
              미리보기 · {checked.length}건 {bad > 0 ? <span className="gb-bad">오류 {bad}건</span> : <span className="gb-good">오류 없음</span>}
            </h2>
            <div className="a-table-box">
              <table className="a-table gb-preview">
                <thead>
                  <tr>
                    <th scope="col">행</th>
                    <th scope="col">브랜드 · 제품</th>
                    <th scope="col">크리에이터</th>
                    <th scope="col">기간</th>
                    <th scope="col">상태</th>
                    <th scope="col" className="gb-r">수량</th>
                    <th scope="col" className="gb-r">총 매출</th>
                    <th scope="col" className="gb-r">회사 수익</th>
                    <th scope="col">확인</th>
                  </tr>
                </thead>
                <tbody>
                  {checked.map(({ value: v, errors }, i) => (
                    <tr key={i} className={errors.length ? "is-bad" : ""}>
                      <td className="a-sub">{i + 2}</td>
                      <td>
                        <b>{v.brand ?? "–"}</b>
                        <div className="a-sub">{v.product ?? "–"}</div>
                      </td>
                      <td>{v.creator ?? "–"}</td>
                      <td className="a-nowrap a-sub">
                        {v.start_date ?? ""}
                        {v.end_date ? ` ~ ${v.end_date}` : ""}
                      </td>
                      <td>{STATUS_LABEL[v.status]}</td>
                      <td className="gb-r">{num(v.units)}</td>
                      <td className="gb-r">{num(v.revenue)}</td>
                      <td className="gb-r">{num(v.company_profit)}</td>
                      <td>{errors.length ? <span className="gb-bad">{errors.join(" ")}</span> : <span className="gb-good">OK</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="a-sub">행 번호는 엑셀의 줄 번호(머리글이 1행)예요. 오류가 있는 줄을 엑셀에서 고친 뒤 다시 올려 주세요.</p>
          </section>

          <div className="gb-actions">
            <button
              type="button"
              className="a-btn"
              disabled={!canSave || pending}
              onClick={() =>
                start(async () => {
                  const r = await importGroupbuys(parsed.rows);
                  setResult(r);
                  if (r.ok) router.push(`/groupbuys?saved=${encodeURIComponent(r.message)}`);
                })
              }
            >
              {pending ? "저장 중…" : `${checked.length}건 저장`}
            </button>
            {!canSave && <span className="a-sub">오류를 모두 고쳐야 저장할 수 있어요.</span>}
            {result && !result.ok && (
              <div className="a-error" role="alert">
                {result.message}
                {result.errors && (
                  <ul>
                    {result.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
