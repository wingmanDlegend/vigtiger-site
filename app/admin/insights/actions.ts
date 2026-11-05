"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { cleanItems, deleteInsight, getInsight, patchInsight } from "@/lib/admin/insights";

type Result = { ok: boolean; message: string; status?: "draft" | "published" };

export type InsightDraft = {
  title: string;
  intro: string;
  takeaway: string;
  items: unknown;
};

function refreshPublic(kind?: string, slug?: string) {
  revalidatePath("/ko/insights");
  if (kind) revalidatePath(`/ko/insights/${kind}`);
  if (kind && slug) revalidatePath(`/ko/insights/${kind}/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/insights");
}

async function guard() {
  if (!(await isAuthed())) redirect("/admin/login");
}

/** 내용 저장 (+ 선택: 게시/게시 취소) */
export async function saveInsight(id: string, draft: InsightDraft, publish?: boolean): Promise<Result> {
  await guard();
  try {
    const title = (draft.title ?? "").trim().slice(0, 200);
    if (!title) return { ok: false, message: "제목을 입력해 주세요." };
    const items = cleanItems(draft.items);
    if (publish && items.length === 0) return { ok: false, message: "기사가 1건 이상 있어야 게시할 수 있어요." };
    const before = await getInsight(id);
    if (!before) return { ok: false, message: "글을 찾을 수 없습니다." };
    const patch: Record<string, unknown> = {
      title,
      intro: (draft.intro ?? "").trim().slice(0, 2000) || null,
      takeaway: (draft.takeaway ?? "").trim().slice(0, 2000) || null,
      items,
    };
    if (publish === true) {
      patch.status = "published";
      patch.published_at = before.published_at ?? new Date().toISOString();
    } else if (publish === false) {
      patch.status = "draft";
    }
    const after = await patchInsight(id, patch);
    refreshPublic(after.kind, after.slug);
    const message =
      publish === true ? "게시했습니다. 홈페이지 인사이트에 바로 보입니다." : publish === false ? "게시를 취소했습니다. 이제 홈페이지에 보이지 않습니다." : "저장했습니다.";
    return { ok: true, message, status: after.status };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "저장하지 못했습니다." };
  }
}

export async function removeInsight(id: string): Promise<Result> {
  await guard();
  let slug: string | undefined;
  let kind: string | undefined;
  try {
    const before = await getInsight(id);
    slug = before?.slug;
    kind = before?.kind;
    await deleteInsight(id);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "삭제하지 못했습니다." };
  }
  refreshPublic(kind, slug);
  redirect("/admin/insights?deleted=1");
}
