import type { Metadata } from "next";
import { requireAdmin } from "@/lib/partners/auth";
import { listBrands, listUsers } from "@/lib/partners/db";
import { fmtDate } from "@/lib/partners/model";
import AdminTop from "@/app/admin/AdminTop";
import { PageHead as PHead } from "@/app/admin/SubNav";
import AccountsPanel from "@/app/admin/to/AccountsPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "직원 계정" };

export default async function AdminAccounts() {
  const s = await requireAdmin();
  const [users, brands] = await Promise.all([listUsers(), listBrands()]);
  const bname = new Map(brands.map((b) => [b.id, b.name_ko]));
  const admins = users.filter((u) => u.role === "admin");
  const brandUsers = users.filter((u) => u.role === "brand");
  return (
    <>
      <AdminTop current="accounts" />
      <main className="a-wrap">
        <PHead
          crumb="설정"
          title="직원 계정"
          desc={
            s.kind === "master"
              ? "업무 관리 시스템(admin.vigtiger.com)을 함께 쓸 대범한사람들 직원 계정을 만들어요. 대표 관리자는 계정 없이 관리자 비밀번호로 들어와요."
              : "업무 관리 시스템(admin.vigtiger.com)을 쓰는 직원 계정 목록이에요."
          }
        />
        <AccountsPanel role="admin" users={admins} canManage={s.kind === "master"} meId={s.userId} />
        <section className="a-card a-sec">
          <h2>브랜드 담당자 계정 전체 ({brandUsers.length})</h2>
          <p className="a-sub">partners.vigtiger.com 에 로그인하는 브랜드 담당자 계정이에요. 발급·비밀번호 재발급·중지는 [티오 파트너스 › 브랜드·계정]의 각 브랜드 화면에서 해요.</p>
          <div className="a-table-box">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">브랜드</th>
                  <th scope="col">담당자</th>
                  <th scope="col">상태</th>
                  <th scope="col">마지막 로그인</th>
                </tr>
              </thead>
              <tbody>
                {brandUsers.map((u) => (
                  <tr key={u.id}>
                    <td><a className="a-name" href={`/to/brands/${u.brand_id}`}>{bname.get(u.brand_id ?? "") ?? "?"}</a></td>
                    <td>{u.name}<div className="a-sub">{u.email}</div></td>
                    <td className="a-nowrap">{!u.active ? "사용 중지" : u.locked_until && new Date(u.locked_until) > new Date() ? "잠김" : u.must_change_password ? "첫 로그인 전" : "사용 중"}</td>
                    <td className="a-nowrap a-sub">{fmtDate(u.last_login_at)}</td>
                  </tr>
                ))}
                {brandUsers.length === 0 && <tr><td colSpan={4} className="a-empty">아직 발급한 브랜드 계정이 없어요.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
