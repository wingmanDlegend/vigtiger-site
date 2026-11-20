import { notFound } from "next/navigation";

// to.vigtiger.com 에 없는 주소 → 티오 사이트 모양의 404 (app/tosite/not-found.tsx)
export default function ToCatchAll() {
  notFound();
}
