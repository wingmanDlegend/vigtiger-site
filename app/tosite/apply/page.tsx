import type { Metadata } from "next";
import { ToFooter, ToHeader } from "@/components/tosite/Chrome";
import ToApplyForm from "@/components/tosite/ToApplyForm";
import { CONTACT } from "@/lib/dictionary";
import { CATEGORY_LABEL } from "@/lib/partners/model";
import { getToCatalog } from "@/lib/tosite/data";

export const metadata: Metadata = {
  title: "상담신청",
  description: "티오(TO)로 써보고 싶은 제품을 찜해 두거나 바로 골라 상담을 신청하세요. 대여 일정과 협찬 조건을 안내해 드립니다.",
  alternates: { canonical: "/apply" },
};

type SP = Promise<{ brand?: string; product?: string; from?: string }>;

export default async function ToApply({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  let data: Awaited<ReturnType<typeof getToCatalog>> | null = null;
  try {
    data = await getToCatalog();
  } catch {
    data = null;
  }
  const withProducts = new Set(data?.products.map((p) => p.brand_id) ?? []);
  const brands = (data?.brands ?? [])
    .filter((b) => withProducts.has(b.id))
    .map((b) => ({ id: b.id, name: b.name_en ? `${b.name_ko} (${b.name_en})` : b.name_ko, category: b.category, categoryLabel: CATEGORY_LABEL[b.category] }));
  const products = (data?.products ?? []).map((p) => ({
    id: p.id,
    brandId: p.brand_id,
    label: `${p.name}${!p.rental && p.sponsor ? " · 협찬만 가능" : ""}`,
    name: p.name,
    image: p.image_url,
    serial: p.serial,
  }));
  // 제품 카드의 '신청하기'로 들어오면 그 제품을 찜 목록에 넣고 첫 번째로 골라 둡니다.
  const initProduct = products.some((p) => p.id === sp.product) ? sp.product : undefined;
  const initBrand = initProduct ? products.find((p) => p.id === initProduct)!.brandId : brands.some((b) => b.id === sp.brand) ? sp.brand : undefined;
  const picked = initProduct ? data!.products.find((p) => p.id === initProduct) : undefined;

  return (
    <>
      <ToHeader current="apply" />
      <main>
        <section className="to-page-head">
          <div className="container">
            <p className="hero-eyebrow">TO 상담신청</p>
            <h1>써보고 싶은 제품을 골라 주세요</h1>
            <p className="hero-body">
              채널 정보와 써보고 싶은 브랜드·제품(1곳 이상, 최대 2곳)을 남겨 주시면, 담당자가 대여 가능 여부와 일정을 확인해 연락드려요. 제품 리스트에서 ♡로 찜해 둔 제품 중에서 고를 수도 있어요.
            </p>
          </div>
        </section>
        <section className="container apply-wrap to-apply">
          <div className="to-apply-main">
            {picked && (
              <p className="to-picked" role="status">
                <b>{data!.brandById.get(picked.brand_id)?.name_ko}</b> · {picked.name} 을(를) 찜하고 첫 번째로 골라 두었어요.
              </p>
            )}
            {data ? (
              <ToApplyForm brands={brands} products={products} initial={{ brand1: initBrand, product1: initProduct, fromWish: sp.from === "wish" }} />
            ) : (
              <p className="form-error" role="alert">
                신청서를 잠시 불러오지 못했어요. 잠시 뒤 다시 열어 주시거나 {CONTACT.email} 로 연락해 주세요.
              </p>
            )}
          </div>
          <aside className="to-apply-side" aria-label="안내">
            <h2 className="h3">신청하면 이렇게 진행돼요</h2>
            <ol className="to-mini-steps">
              <li>
                <b>신청 확인</b>
                <span>채널과 희망 브랜드를 확인해요.</span>
              </li>
              <li>
                <b>일정 조율</b>
                <span>브랜드와 대여 가능 일정을 맞춰 연락드려요.</span>
              </li>
              <li>
                <b>수령 후 사용</b>
                <span>별도 요구 없이 편하게 써보세요.</span>
              </li>
              <li>
                <b>반납 · 공구 제안</b>
                <span>마음에 들면 공동구매까지 함께 준비해요.</span>
              </li>
            </ol>
            <p className="to-side-note">
              아직 브랜드를 못 정했다면 <a href="/products">TO 제품 리스트</a>에서 먼저 둘러보세요.
              <br />
              문의: <a href={CONTACT.kakao} target="_blank" rel="noopener noreferrer">카카오톡</a> · <a href={`tel:${CONTACT.phoneTel}`}>{CONTACT.phone}</a>
            </p>
          </aside>
        </section>
      </main>
      <ToFooter />
    </>
  );
}
