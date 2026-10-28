import { isAuthed } from "@/lib/admin/auth";
import { exportApplications, STATUSES } from "@/lib/admin/db";
import { STATUS_LABEL, TYPE_LABEL, detailRows, kst } from "@/lib/admin/format";
import { FORMS, FORM_TYPES } from "@/lib/forms";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  // 엑셀 수식 주입 방지 + 따옴표 이스케이프
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await isAuthed())) return new Response("Unauthorized", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const type = sp.get("type") ?? undefined;
  const status = sp.get("status") ?? undefined;
  const q = sp.get("q") ?? undefined;
  const rows = await exportApplications({ type, status, q });

  // 유형을 하나만 내려받으면 그 유형의 항목을 칸으로 펼치고, 전체면 '신청 내용' 한 칸에 모읍니다.
  const single = type && (FORM_TYPES as string[]).includes(type) ? FORMS[type as keyof typeof FORMS] : null;
  const detailHeads = single ? single.fields.map((f) => f.label.ko) : ["신청 내용"];
  const head = ["접수일시(KST)", "유형", "상태", "이름", "회사·채널", "이메일", "연락처", ...detailHeads, "메시지", "내부 메모", "신청 페이지"];

  const lines = [head.map(cell).join(",")];
  for (const a of rows) {
    const d = detailRows(a);
    const detailCells = single ? d.map((r) => r.value) : [d.map((r) => `${r.label}: ${r.value || "-"}`).join(" / ")];
    lines.push(
      [
        kst(a.created_at),
        TYPE_LABEL[a.type],
        STATUS_LABEL[a.status] ?? a.status,
        a.name,
        a.company,
        a.email,
        a.phone,
        ...detailCells,
        a.message,
        a.admin_note,
        a.lang === "en" ? "영문" : "한국어",
      ]
        .map(cell)
        .join(","),
    );
  }
  const today = new Date().toISOString().slice(0, 10);
  const name = `vigtiger_applications_${type ?? "all"}${status && (STATUSES as readonly string[]).includes(status) ? `_${status}` : ""}_${today}.csv`;
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
