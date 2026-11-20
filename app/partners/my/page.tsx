import type { Metadata } from "next";
import { requireBrand } from "@/lib/partners/auth";
import { getBrand, listProducts } from "@/lib/partners/db";
import { CATEGORY_LABEL, PRODUCT_FIELDS, fieldText, fmtDate, type ProductStatus } from "@/lib/partners/model";
import PTop, { PHead } from "../PTop";
import { RequestTags, StatusBadge, Thumb } from "@/components/partners/ui";
import RowActions from "./RowActions";
import VisToggle from "./VisToggle";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "제품 관리" };

type SP = Promise<{ sent?: string; status?: string; pw?: string }>;

const FILTERS: { key: string; label: string; test: (p: { status: ProductStatus; pending_changes: unknown; delete_requested: boolean }) => boolean }[] = [
  { key: "", label: "전체", test: () => true },
  { key: "waiting", label: "승인 대기·요청 중", test: (p) => p.status === "pending" || !!p.pending_changes || p.delete_requested },
  { key: "approved", label: "게시 중", test: (p) => p.status === "approved" },
  { key: "rejected", label: "반려", test: (p) => p.status === "rejected" },
  { key: "hidden", label: "숨김", test: (p) => p.status === "hidden" },
];

export default async function MyProducts({ searchParams }: { searchParams: SP }) {
  const s = await requireBrand();
  const sp = await searchParams;
  const [brand, all] = await Promise.all([getBrand(s.brandId), listProducts({ brandId: s.brandId })]);
  const f = FILTERS.find((x) => x.key === (sp.status ?? "")) ?? FILTERS[0];
  const rows = all.filter(f.test);
  const waiting = all.filter(FILTERS[1].test).length;
  const rejected = all.filter((p) => p.status === "rejected").length;

  return (
    <>
      <PTop s={s} current="products" brandName={brand?.name_ko} />
      <main className="a-wrap">
        <PHead
          crumb={brand ? `${brand.name_ko} · ${CATEGORY_LABEL[brand.category]}` : undefined}
          title="제품 관리"
          desc="제품 등록·정보 수정·삭제는 대범한사람들 담당자가 확인하고 승인하면 반영돼요. 'TO 노출'은 승인 없이 바로 켜고 끌 수 있어요."
          actions={<a className="a-btn" href="/my/new">+ 제품 등록</a>}
        />
        {brand && !brand.active && (
          <p className="a-note" role="note">
            지금은 크리에이터용 제품 리스트(to.vigtiger.com)에 노출되지 않는 브랜드예요. 제품 등록·수정 요청은 그대로 할 수 있고, 노출은 대범한사람들 담당자가 정해요.
          </p>
        )}
        {sp.pw && <p className="a-saved" role="status">비밀번호를 바꿨어요.</p>}
        {sp.sent === "new" && <p className="a-saved" role="status">등록을 요청했어요. 승인되면 일련번호가 붙고 리스트에 올라가요.</p>}
        {sp.sent === "edit" && <p className="a-saved" role="status">수정을 요청했어요. 승인 전까지는 지금 게시된 내용이 그대로 보여요.</p>}
        {rejected > 0 && (
          <p className="a-note" role="note">
            반려된 제품이 {rejected}개 있어요. 반려 사유를 확인하고 고쳐서 다시 요청해 주세요.
          </p>
        )}

        <nav className="a-tabs" aria-label="상태">
          {FILTERS.map((x) => (
            <a key={x.key} className="a-tab" href={x.key ? `/my?status=${x.key}` : "/my"} aria-current={f.key === x.key ? "page" : undefined}>
              {x.label} <b>{all.filter(x.test).length}</b>
            </a>
          ))}
        </nav>

        <section className="a-card" aria-label="제품 목록">
          <div className="a-table-box">
            <table className="a-table p-table">
              <thead>
                <tr>
                  <th scope="col">제품</th>
                  <th scope="col">일련번호</th>
                  <th scope="col">가격 · 수수료</th>
                  <th scope="col">협찬·대여</th>
                  <th scope="col">TO 노출</th>
                  <th scope="col">상태</th>
                  <th scope="col">최근 변경</th>
                  <th scope="col"><span className="sr-only">작업</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="p-prod">
                        <Thumb src={p.image_url} />
                        <div>
                          <a className="a-name" href={`/my/${p.id}`}>{p.name}</a>
                          {p.section && <div className="a-sub">{p.section}</div>}
                          {p.status === "rejected" && p.reject_reason && <div className="p-reason">반려 사유: {p.reject_reason}</div>}
                          {p.status !== "rejected" && p.reject_reason && !p.pending_changes && !p.delete_requested && (
                            <div className="p-reason">지난 요청이 반려됐어요: {p.reject_reason}</div>
                          )}
                          {p.pending_changes && (
                            <div className="a-sub">
                              바꾸려는 항목: {PRODUCT_FIELDS.filter((x) => x.key in (p.pending_changes ?? {})).map((x) => x.label).join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="a-nowrap">{p.serial ?? <span className="a-sub">승인 시 부여</span>}</td>
                    <td className="a-nowrap">
                      {p.groupbuy_price !== null || p.online_price !== null ? (
                        <>
                          <div>공구가 {fieldText("groupbuy_price", p.groupbuy_price)}</div>
                          <div className="a-sub">
                            판매가 {fieldText("online_price", p.online_price)} · 수수료 {fieldText("commission_rate", p.commission_rate)}
                          </div>
                        </>
                      ) : (
                        <a className="a-sub" href={`/my/${p.id}`}>가격 입력하기</a>
                      )}
                    </td>
                    <td className="a-nowrap">협찬 {p.sponsor ? "가능" : "-"} · 대여 {p.rental ? "가능" : "-"}</td>
                    <td className="a-nowrap">
                      <VisToggle id={p.id} name={p.name} on={p.to_visible !== false} />
                    </td>
                    <td className="a-nowrap">
                      <StatusBadge status={p.status} /> <RequestTags p={p} />
                    </td>
                    <td className="a-nowrap a-sub">{fmtDate(p.change_requested_at ?? p.updated_at)}</td>
                    <td className="a-nowrap">
                      <RowActions id={p.id} name={p.name} live={p.status === "approved" || p.status === "hidden"} hasRequest={!!p.pending_changes || p.delete_requested} />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="a-empty">
                      {all.length === 0 ? "아직 등록한 제품이 없어요. '+ 제품 등록'으로 첫 제품을 올려 주세요." : "이 상태의 제품이 없어요."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        {waiting > 0 && <p className="a-sub">승인 대기·요청 중 {waiting}건 — 보통 영업일 기준 1~2일 안에 확인해요.</p>}
      </main>
    </>
  );
}
