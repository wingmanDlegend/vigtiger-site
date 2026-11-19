import { isAuthed } from "@/lib/admin/auth";
import { CSV_HEADERS, csvEscape } from "@/lib/groupbuy";

// 엑셀 업로드 양식 (머리글 + 예시 1줄). 엑셀에서 열어 채운 뒤 그대로 올리면 됩니다.
export async function GET() {
  if (!(await isAuthed())) return new Response("Unauthorized", { status: 401 });
  const example = [
    "예시브랜드", "예시 단백질 쉐이크 2박스", "예시채널", "YouTube", "2026-10-01", "2026-10-07", "완료",
    "39000", "29900", "420", "", "15", "", "2100000", "O", "2026-10-20",
    "https://www.youtube.com/watch?v=example", "185000", "6200", "재진행 추천", "재구매 문의가 많아 시즌 한정으로 다시 진행", "예시 줄은 지우고 입력하세요",
  ];
  const body = "﻿" + [CSV_HEADERS.map(csvEscape).join(","), example.map(csvEscape).join(",")].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="groupbuy-template.csv"; filename*=UTF-8''${encodeURIComponent("공동구매결과_업로드양식.csv")}`,
      "Cache-Control": "no-store",
    },
  });
}
