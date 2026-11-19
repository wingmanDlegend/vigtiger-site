import type { Metadata, Viewport } from "next";
import "../admin/admin.css";
import "@/components/partners/partners.css";

export const metadata: Metadata = {
  title: { default: "TO 파트너스 — 대범한사람들", template: "%s · TO 파트너스" },
  description: "티오(TO) 대여·협찬 제품을 등록하고 관리하는 브랜드 파트너 전용 사이트",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="a-body p-body">{children}</body>
    </html>
  );
}
