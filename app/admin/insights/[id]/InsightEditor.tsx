"use client";

import { useState, useTransition } from "react";
import type { InsightItem, InsightPost } from "@/lib/insights";
import { removeInsight, saveInsight } from "../actions";

type Msg = { ok: boolean; message: string } | null;

export default function InsightEditor({ post }: { post: InsightPost }) {
  const [title, setTitle] = useState(post.title);
  const [intro, setIntro] = useState(post.intro ?? "");
  const [takeaway, setTakeaway] = useState(post.takeaway ?? "");
  const [items, setItems] = useState<InsightItem[]>(post.items);
  const [status, setStatus] = useState(post.status);
  const [msg, setMsg] = useState<Msg>(null);
  const [asking, setAsking] = useState(false);
  const [pending, start] = useTransition();

  const setItem = (i: number, patch: Partial<InsightItem>) =>
    setItems((arr) => arr.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const move = (i: number, d: -1 | 1) =>
    setItems((arr) => {
      const j = i + d;
      if (j < 0 || j >= arr.length) return arr;
      const next = [...arr];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  function run(publish?: boolean) {
    setMsg(null);
    start(async () => {
      const r = await saveInsight(post.id, { title, intro, takeaway, items }, publish);
      setMsg(r);
      if (r.ok && r.status) setStatus(r.status);
    });
  }

  return (
    <div className="a-detail">
      <div className="a-detail-main">
        <section className="a-card a-sec">
          <h2>글 정보</h2>
          <label className="a-label" htmlFor="i-title">제목</label>
          <input id="i-title" className="a-input" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
          <label className="a-label" htmlFor="i-intro">도입 요약 (목록과 글 맨 위에 보여요)</label>
          <textarea id="i-intro" className="a-textarea" value={intro} maxLength={2000} onChange={(e) => setIntro(e.target.value)} />
          <label className="a-label" htmlFor="i-take">대범한사람들의 시선 (글 맨 아래 정리)</label>
          <textarea id="i-take" className="a-textarea" value={takeaway} maxLength={2000} onChange={(e) => setTakeaway(e.target.value)} />
        </section>

        <section className="a-card a-sec">
          <h2>기사 {items.length}건</h2>
          <p className="a-sub">요약을 다듬거나, 빼고 싶은 기사는 삭제하세요. 위아래 버튼으로 순서를 바꿀 수 있어요.</p>
          {items.map((it, i) => (
            <fieldset key={i} className="a-item">
              <legend>
                {i + 1}. {it.source || "출처"} · {it.region}
              </legend>
              <div className="a-item-row">
                <select
                  aria-label="구분"
                  className="a-select"
                  value={it.region}
                  onChange={(e) => setItem(i, { region: e.target.value === "해외" ? "해외" : "국내" })}
                >
                  <option value="국내">국내</option>
                  <option value="해외">해외</option>
                </select>
                <input aria-label="출처(언론사)" className="a-input" value={it.source} onChange={(e) => setItem(i, { source: e.target.value })} placeholder="언론사" />
                <input aria-label="기사 날짜" className="a-input" value={it.published ?? ""} onChange={(e) => setItem(i, { published: e.target.value })} placeholder="YYYY-MM-DD" />
              </div>
              <input aria-label="기사 제목" className="a-input" value={it.title} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="기사 제목" />
              <input aria-label="원문 링크" className="a-input" value={it.url} onChange={(e) => setItem(i, { url: e.target.value })} placeholder="https://" />
              <textarea aria-label="요약" className="a-textarea" value={it.summary} onChange={(e) => setItem(i, { summary: e.target.value })} />
              <div className="a-row">
                <a className="a-btn is-ghost" href={it.url} target="_blank" rel="noopener noreferrer">원문 열기 ↗</a>
                <button type="button" className="a-btn is-ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${i + 1}번 기사 위로`}>↑</button>
                <button type="button" className="a-btn is-ghost" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`${i + 1}번 기사 아래로`}>↓</button>
                <button type="button" className="a-btn is-danger-ghost" onClick={() => setItems((arr) => arr.filter((_, k) => k !== i))}>이 기사 빼기</button>
              </div>
            </fieldset>
          ))}
        </section>
      </div>

      <aside className="a-detail-side">
        <section className="a-card a-sec">
          <h2>게시</h2>
          <p>
            상태:{" "}
            <span className="a-badge" style={status === "published" ? { background: "#e9f7ee", color: "#11552a" } : { background: "#fff1e6", color: "#a12a00" }}>
              {status === "published" ? "게시됨" : "검토 대기"}
            </span>
          </p>
          <button type="button" className="a-btn is-ghost" onClick={() => run()} disabled={pending} style={{ justifyContent: "center" }}>
            {pending ? "처리 중…" : "저장만 하기"}
          </button>
          {status === "draft" ? (
            <button type="button" className="a-btn" onClick={() => run(true)} disabled={pending} style={{ justifyContent: "center" }}>
              저장하고 게시
            </button>
          ) : (
            <>
              <button type="button" className="a-btn" onClick={() => run(true)} disabled={pending} style={{ justifyContent: "center" }}>
                수정 내용 반영
              </button>
              <button type="button" className="a-btn is-ghost" onClick={() => run(false)} disabled={pending} style={{ justifyContent: "center" }}>
                게시 취소
              </button>
              <a className="a-btn is-ghost" href={`/insights/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ justifyContent: "center" }}>
                홈페이지에서 보기 ↗
              </a>
            </>
          )}
          {msg && (
            <p className={msg.ok ? "a-saved" : "a-error"} role="status">
              {msg.message}
            </p>
          )}
        </section>

        <section className="a-card a-sec a-danger">
          <h2>글 삭제</h2>
          {!asking ? (
            <button type="button" className="a-btn is-danger-ghost" onClick={() => setAsking(true)}>이 글 삭제</button>
          ) : (
            <>
              <p className="a-confirm">이 글을 영구 삭제할까요? 삭제 후에는 복구할 수 없습니다.</p>
              <div className="a-row">
                <button
                  type="button"
                  className="a-btn is-danger"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await removeInsight(post.id);
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
      </aside>
    </div>
  );
}
