"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { deleteGroupbuy, insertGroupbuys, updateGroupbuy } from "@/lib/admin/groupbuys";
import { cleanGroupbuy, type GBInput } from "@/lib/groupbuy";

type Raw = Partial<Record<keyof GBInput, unknown>>;
export type GBResult = { ok: boolean; message: string; errors?: string[]; id?: string };

async function guard() {
  if (!(await isAuthed())) redirect("/login");
}

export async function createGroupbuy(raw: Raw): Promise<GBResult> {
  await guard();
  const { value, errors } = cleanGroupbuy(raw);
  if (errors.length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors };
  try {
    const [row] = await insertGroupbuys([value]);
    revalidatePath("/admin/groupbuys");
    return { ok: true, message: "저장했습니다.", id: row?.id };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "저장하지 못했습니다." };
  }
}

export async function saveGroupbuy(id: string, raw: Raw): Promise<GBResult> {
  await guard();
  const { value, errors } = cleanGroupbuy(raw);
  if (errors.length) return { ok: false, message: "입력 내용을 확인해 주세요.", errors };
  try {
    await updateGroupbuy(id, value);
    revalidatePath("/admin/groupbuys");
    return { ok: true, message: "저장했습니다.", id };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "저장하지 못했습니다." };
  }
}

export async function removeGroupbuy(id: string): Promise<GBResult> {
  await guard();
  try {
    await deleteGroupbuy(id);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "삭제하지 못했습니다." };
  }
  revalidatePath("/admin/groupbuys");
  redirect("/groupbuys?deleted=1");
}

/** 엑셀 일괄 저장 — 모든 줄이 검증을 통과해야 저장 (일부만 들어가는 일 방지) */
export async function importGroupbuys(rows: Raw[]): Promise<GBResult> {
  await guard();
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, message: "저장할 줄이 없습니다." };
  if (rows.length > 1000) return { ok: false, message: "한 번에 1,000줄까지 올릴 수 있어요. 나눠서 올려 주세요." };
  const cleaned = rows.map((r) => cleanGroupbuy(r));
  const bad = cleaned.map((c, i) => (c.errors.length ? `${i + 2}행: ${c.errors.join(" ")}` : null)).filter(Boolean) as string[];
  if (bad.length) return { ok: false, message: `${bad.length}개 줄에 오류가 있어 저장하지 않았습니다.`, errors: bad.slice(0, 50) };
  try {
    const saved = await insertGroupbuys(cleaned.map((c) => c.value));
    revalidatePath("/admin/groupbuys");
    return { ok: true, message: `${saved.length}건을 저장했습니다.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "저장하지 못했습니다." };
  }
}
