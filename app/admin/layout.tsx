import type { Metadata, Viewport } from "next";
import "./admin.css";
import "@/components/partners/partners.css";

export const metadata: Metadata = {
  title: { default: "업무 관리 — 대범한사람들", template: "%s · 업무 관리" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&display=swap" />
      </head>
      <body className="a-body">{children}</body>
    </html>
  );
}
