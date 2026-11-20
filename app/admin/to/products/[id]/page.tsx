import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/partners/auth";
import { getProduct, listBrands, listEvents, listProducts } from "@/lib/partners/db";
import { fmtDate, productToDraft } from "@/lib/partners/model";
import AdminTop from "@/app/admin/AdminTop";
import { PageHead as PHead } from "@/app/admin/SubNav";
import ProductForm from "@/components/partners/ProductForm";
import { RequestTags, StatusBadge } from "@/components/partners/ui";
import { adminSaveProductAction } from "../../actions";
import { eventLabel } from "../../events";
import DangerDelete from "./DangerDelete";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "제품 수정" };

export default async function AdminProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const s = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const p = await getProduct(id);
  if (!p) notFound();
  const [brands, siblings, events] = await Promise.all([listBrands(), listProducts({ brandId: p.brand_id }), listEvents({ productId: id, limit: 20 })]);
  const sections = [...new Set(siblings.map((x) => x.section).filter(Boolean) as string[])];
  const brand = brands.find((b) => b.id === p.brand_id);

  return (
    <>
      <AdminTop current="to-products" />
      <main className="a-wrap">
        <PHead
          crumb={`티오 파트너스 · 제품 · ${brand?.name_ko ?? ""}`}
          title={p.name}
          desc="관리자 저장은 승인 없이 바로 반영돼요."
          actions={<span className="p-actions"><StatusBadge status={p.status} /> <RequestTags p={p} /></span>}
        />
        {sp.saved && <p className="a-saved" role="status">저장했어요.</p>}
        {(p.pending_changes || p.delete_requested || p.status === "pending") && (
          <p className="a-note" role="note">
            브랜드 담당자의 요청이 있어요. <a href="/to/review">승인 대기</a>에서 바뀐 내용을 비교하고 처리할 수 있어요.
          </p>
        )}
        <ProductForm
          initial={productToDraft(p)}
          submit={adminSaveProductAction.bind(null, p.id)}
          sections={sections}
          submitLabel="저장"
          cancelHref="/to/products"
          admin={{
            extra: { brand_id: p.brand_id, serial: p.serial ?? "", status: p.status, sort: String(p.sort), to_visible: p.to_visible !== false },
            brands: brands.map((b) => ({ id: b.id, label: `${b.name_ko} (${b.code})` })),
          }}
        />
        <section className="a-card a-sec">
          <h2>작업 기록</h2>
          <ol className="p-log">
            {events.map((e) => (
              <li key={e.id}>
                <span className="a-sub a-nowrap">{fmtDate(e.created_at)}</span>
                <span><b>{e.actor_label ?? "–"}</b> · {eventLabel(e.action)}{typeof e.detail?.reason === "string" ? ` — ${e.detail.reason}` : ""}</span>
              </li>
            ))}
            {events.length === 0 && <li className="a-sub">초기 데이터로 들어온 뒤 바뀐 기록이 없어요.</li>}
          </ol>
        </section>
        <DangerDelete id={p.id} name={p.name} />
      </main>
    </>
  );
}
