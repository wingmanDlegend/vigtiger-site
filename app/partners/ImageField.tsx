"use client";

import { useRef, useState } from "react";
import { uploadImageAction } from "./actions";

/** 큰 사진은 브라우저에서 줄여서(긴 변 1200px) 올립니다. */
async function shrink(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("JPG, PNG, WEBP 이미지만 올릴 수 있어요.");
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return file;
  const max = 1200;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 900_000) return file;
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  const ctx = c.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  return await new Promise<Blob>((res) => c.toBlob((b) => res(b ?? file), "image/jpeg", 0.86));
}

export default function ImageField({
  id,
  label,
  value,
  onChange,
  folder = "products",
  hint,
  wide,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: "products" | "brands";
  hint?: string;
  wide?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pick(f: File | undefined) {
    if (!f) return;
    setErr("");
    setBusy(true);
    try {
      const blob = await shrink(f);
      if (blob.size > 3 * 1024 * 1024) throw new Error("이미지는 3MB 이하로 올려 주세요.");
      const fd = new FormData();
      fd.set("file", new File([blob], f.name.replace(/\.[^.]+$/, "") + (blob.type === "image/jpeg" ? ".jpg" : ""), { type: blob.type || f.type }));
      fd.set("folder", folder);
      const r = await uploadImageAction(fd);
      if (!r.ok || !r.url) throw new Error(r.message || "올리지 못했어요.");
      onChange(r.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "올리지 못했어요.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className={`p-img ${wide ? "is-wide" : ""}`}>
      <span className="a-label" id={`${id}-label`}>{label}</span>
      <div className="p-img-row">
        <div className={`p-img-box ${wide ? "is-wide" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" /> : <span>이미지 없음</span>}
        </div>
        <div className="p-img-tools">
          <input
            ref={ref}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-labelledby={`${id}-label`}
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <button type="button" className="a-btn is-ghost" disabled={busy} onClick={() => ref.current?.click()}>
            {busy ? "올리는 중…" : value ? "이미지 바꾸기" : "이미지 올리기"}
          </button>
          {value && !busy && (
            <button type="button" className="p-link" onClick={() => onChange("")}>이미지 빼기</button>
          )}
          <p className="a-sub">{hint ?? "JPG·PNG·WEBP, 3MB 이하. 정사각형 사진이 가장 잘 보여요."}</p>
          {err && <p className="a-error" role="alert">{err}</p>}
        </div>
      </div>
    </div>
  );
}
