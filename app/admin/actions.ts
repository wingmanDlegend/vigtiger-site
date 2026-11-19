"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/admin/auth";
import { deleteApplication, updateApplication, STATUSES, type Status } from "@/lib/admin/db";

export async function saveApplication(id: string, _: unknown, formData: FormData) {
  if (!(await isAuthed())) redirect("/login");
  const status = String(formData.get("status") ?? "") as Status;
  const note = String(formData.get("admin_note") ?? "");
  try {
    await updateApplication(id, {
      status: (STATUSES as readonly string[]).includes(status) ? status : undefined,
      admin_note: note.trim() ? note : null,
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "저장하지 못했습니다." };
  }
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  return { ok: true, message: "저장했습니다." };
}

/** 목록에서 상태만 빠르게 바꾸기 */
export async function quickStatus(formData: FormData) {
  if (!(await isAuthed())) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as Status;
  if ((STATUSES as readonly string[]).includes(status)) await updateApplication(id, { status });
  revalidatePath("/admin/applications");
}

/** 신청 1건 영구 삭제 → 목록으로 이동 */
export async function removeApplication(id: string, type: string) {
  if (!(await isAuthed())) redirect("/login");
  try {
    await deleteApplication(id);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "삭제하지 못했습니다." };
  }
  revalidatePath("/admin/applications");
  const t = ["creator", "advertiser", "partner"].includes(type) ? `type=${type}&` : "";
  redirect(`/applications?${t}deleted=1`);
}
