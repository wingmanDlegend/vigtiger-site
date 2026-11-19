import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import AdminTop from "../../AdminTop";
import ImportClient from "./ImportClient";

export const dynamic = "force-dynamic";

export default async function ImportGroupbuys() {
  if (!(await isAuthed())) redirect("/admin/login");
  return (
    <>
      <AdminTop current="groupbuys" />
      <main className="a-wrap">
        <a className="a-back" href="/admin/groupbuys">← 공동구매 결과 목록</a>
        <h1 className="a-h1">엑셀로 한 번에 올리기</h1>
        <ol className="gb-steps">
          <li>
            <a href="/admin/groupbuys/template">업로드 양식(CSV)</a>을 내려받아 엑셀에서 열고, 예시 줄을 지운 뒤 한 줄에 공동구매 한 건씩 채웁니다.
            쓰시던 엑셀이 있다면 첫 줄의 머리글만 양식과 비슷하게 맞춰도 됩니다. (예: 매출액·판매수량·수수료율·정산여부)
          </li>
          <li>엑셀 파일(.xlsx)이나 CSV 파일을 아래에 올리면 저장 전에 미리보기와 오류를 보여 드립니다.</li>
          <li>오류가 없으면 <b>저장</b>을 누릅니다. 한 줄이라도 오류가 있으면 아무것도 저장되지 않으니 안심하고 올려 보세요.</li>
        </ol>
        <ImportClient />
      </main>
    </>
  );
}
