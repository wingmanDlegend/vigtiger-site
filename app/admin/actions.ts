"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, checkPassword, createSessionValue, isAuthed } from "@/lib/admin/auth";
import { updateApplication, STATUSES, type Status } from "@/lib/admin/db";

export async function login(_: unknown, formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  // 무차별 대입을 늦추기 위한 짧은 지연
  await new Promise((r) => setTimeout(r, 600));
  if (!checkPassword(pw)) return { error: "비밀번호가 맞지 않습니다." };
  const { value, maxAge } = createSessionValue();
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
  redirect("/admin/login");
}

export async function saveApplication(id: string, _: unknown, formData: FormData) {
  if (!(await isAuthed())) redirect("/admin/login");
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
  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  return { ok: true, message: "저장했습니다." };
}

/** 목록에서 상태만 빠르게 바꾸기 */
export async function quickStatus(formData: FormData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as Status;
  if ((STATUSES as readonly string[]).includes(status)) await updateApplication(id, { status });
  revalidatePath("/admin");
}
