import { notFound, redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getGroupbuy } from "@/lib/admin/groupbuys";
import { kst } from "@/lib/admin/format";
import { period } from "@/lib/groupbuy";
import AdminTop from "../../AdminTop";
import GroupbuyForm from "../GroupbuyForm";

export const dynamic = "force-dynamic";

export default async function EditGroupbuy({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const { id } = await params;
  const g = await getGroupbuy(id);
  if (!g) notFound();
  return (
    <>
      <AdminTop current="groupbuys" />
      <main className="a-wrap">
        <a className="a-back" href="/admin/groupbuys">← 공동구매 목록</a>
        <h1 className="a-h1">
          {g.brand} · {g.creator}
        </h1>
        <p className="a-sub">
          {g.product} · {period(g)} · 마지막 수정 {kst(g.updated_at)}
        </p>
        <GroupbuyForm item={g} />
      </main>
    </>
  );
}
