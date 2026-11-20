import { ToFooter, ToHeader } from "@/components/tosite/Chrome";

export default function ToNotFound() {
  return (
    <>
      <ToHeader />
      <main className="container section" style={{ minHeight: "50vh" }}>
        <p className="eyebrow">404</p>
        <h1 className="h2" style={{ marginTop: 8 }}>페이지를 찾을 수 없어요</h1>
        <p className="lead" style={{ marginTop: 16 }}>
          주소가 바뀌었거나 없는 페이지예요. <a href="/products">TO 제품 리스트</a>나 <a href="/apply">상담신청</a>으로 이동해 보세요.
        </p>
      </main>
      <ToFooter />
    </>
  );
}
