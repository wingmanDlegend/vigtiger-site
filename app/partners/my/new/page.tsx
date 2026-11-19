import type { Metadata } from "next";
import { requireBrand } from "@/lib/partners/auth";
import { getBrand, listProducts } from "@/lib/partners/db";
import PTop, { PHead } from "../../PTop";
import ProductForm from "@/components/partners/ProductForm";
import { createProductAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "제품 등록" };

export default async function NewProduct() {
  const s = await requireBrand();
  const [brand, products] = await Promise.all([getBrand(s.brandId), listProducts({ brandId: s.brandId })]);
  const sections = [...new Set(products.map((p) => p.section).filter(Boolean) as string[])];
  return (
    <>
      <PTop s={s} current="b-new" brandName={brand?.name_ko} />
      <main className="a-wrap">
        <PHead crumb="내 제품" title="제품 등록" desc="저장하면 '승인 대기'가 돼요. 담당자가 승인하면 티오 일련번호가 붙고 제품 리스트에 올라가요." />
        <ProductForm submit={createProductAction} sections={sections} submitLabel="등록 요청" cancelHref="/my" />
      </main>
    </>
  );
}
