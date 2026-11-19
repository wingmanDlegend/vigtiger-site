import { isAuthed } from "@/lib/admin/auth";
import { listGroupbuys } from "@/lib/admin/groupbuys";
import { CSV_HEADERS, FIELDS, csvEscape, toCsvCell, type GBStatus } from "@/lib/groupbuy";

export const dynamic = "force-dynamic";

// 목록 화면과 같은 필터로 CSV(엑셀) 내려받기
export async function GET(req: Request) {
  if (!(await isAuthed())) return new Response("Unauthorized", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const status = sp.get("status") as GBStatus | null;
  const q = (sp.get("q") ?? "").trim().toLowerCase();
  const year = sp.get("year");
  const unsettled = sp.get("unsettled") === "1";
  const rows = (await listGroupbuys()).filter(
    (r) =>
      (!status || r.status === status) &&
      (!year || (r.start_date ?? r.created_at).startsWith(year)) &&
      (!unsettled || (!r.settled && r.status === "done")) &&
      (!q || [r.brand, r.product, r.creator, r.platform ?? ""].some((s) => s.toLowerCase().includes(q))),
  );
  const lines = [CSV_HEADERS.map(csvEscape).join(","), ...rows.map((r) => FIELDS.map((f) => csvEscape(toCsvCell(r, f))).join(","))];
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="groupbuys-${today}.csv"; filename*=UTF-8''${encodeURIComponent(`공동구매결과-${today}.csv`)}`,
      "Cache-Control": "no-store",
    },
  });
}
