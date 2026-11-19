import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import AdminTop from "../../AdminTop";
import GroupbuyForm from "../GroupbuyForm";

export const dynamic = "force-dynamic";

export default async function NewGroupbuy() {
  if (!(await isAuthed())) redirect("/login");
  return (
    <>
      <AdminTop current="groupbuys" />
      <main className="a-wrap">
        <a className="a-back" href="/groupbuys">← 공동구매 목록</a>
        <h1 className="a-h1">공동구매 결과 입력</h1>
        <p className="a-sub">* 표시만 필수예요. 나머지는 아는 것만 채우고 나중에 수정해도 됩니다.</p>
        <GroupbuyForm />
      </main>
    </>
  );
}
