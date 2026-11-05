import { notFound, redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getInsight } from "@/lib/admin/insights";
import { kst } from "@/lib/admin/format";
import { KIND_META, formatKoDate } from "@/lib/insights";
import AdminTop from "../../AdminTop";
import InsightEditor from "./InsightEditor";

export const dynamic = "force-dynamic";

export default async function AdminInsightEdit({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const { id } = await params;
  const p = await getInsight(id);
  if (!p) notFound();
  return (
    <>
      <AdminTop current="insights" />
      <main className="a-wrap">
        <a className="a-back" href="/admin/insights">← 인사이트 목록</a>
        <h1 className="a-h1">{formatKoDate(p.post_date)} {KIND_META[p.kind].label}</h1>
        <p className="a-sub">
          만든 시각 {kst(p.created_at)} · 마지막 수정 {kst(p.updated_at)}
          {p.published_at && <> · 처음 게시 {kst(p.published_at)}</>}
        </p>
        <InsightEditor post={p} />
      </main>
    </>
  );
}
