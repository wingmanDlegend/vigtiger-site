import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/partners/auth";
import { getBrand, getProduct, listProducts } from "@/lib/partners/db";
import { productToDraft } from "@/lib/partners/model";
import PTop, { PHead } from "../../PTop";
import ProductForm from "../../ProductForm";
import { CatalogCell, RequestTags, StatusBadge } from "../../ui";
import { updateProductAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "제품 수정" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSession({ role: "brand" });
  const { id } = await params;
  const p = await getProduct(id);
  if (!p || p.brand_id !== s.brandId) notFound();
  const [brand, products] = await Promise.all([getBrand(s.brandId!), listProducts({ brandId: s.brandId! })]);
  const sections = [...new Set(products.map((x) => x.section).filter(Boolean) as string[])];
  const live = productToDraft(p);
  const initial = { ...live, ...(p.pending_changes ?? {}) };
  const isLive = p.status === "approved" || p.status === "hidden";

  return (
    <>
      <PTop s={s} current="b-home" brandName={brand?.name_ko} />
      <main className="a-wrap">
        <PHead
          crumb="내 제품"
          title={p.name}
          desc={
            isLive
              ? "게시 중인 제품이에요. 고쳐서 저장하면 '수정 요청'이 되고, 승인 전까지는 지금 내용이 그대로 보여요."
              : "아직 승인 전이에요. 고쳐서 저장하면 다시 '승인 대기'가 돼요."
          }
          actions={
            <span className="p-actions">
              <StatusBadge status={p.status} /> <RequestTags p={p} />
            </span>
          }
        />
        {p.reject_reason && <p className="a-error" role="note">반려 사유: {p.reject_reason}</p>}
        {p.delete_requested && <p className="a-note" role="note">이 제품은 삭제를 요청한 상태예요. 목록에서 '요청 취소'를 누르면 되돌릴 수 있어요.</p>}
        {isLive && (
          <section className="a-card a-sec">
            <h2>지금 리스트에 보이는 모습</h2>
            <div className="c-preview">
              <CatalogCell p={live} serial={p.serial} />
            </div>
          </section>
        )}
        <ProductForm
          initial={initial}
          submit={updateProductAction.bind(null, p.id)}
          sections={sections}
          submitLabel={isLive ? "수정 요청" : "다시 요청"}
          cancelHref="/my"
        />
      </main>
    </>
  );
}
