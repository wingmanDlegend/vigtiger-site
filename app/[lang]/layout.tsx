import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { LANGS, getDict, isLang } from "@/lib/dictionary";
import { SITE_URL } from "@/lib/site";
import Analytics from "@/components/Analytics";

export const dynamicParams = false;
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}


export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: lang === "ko" ? "/" : "/en",
      languages: { ko: "/", en: "/en" },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      siteName: lang === "ko" ? "대범한사람들" : "VIGTIGER",
      locale: lang === "ko" ? "ko_KR" : "en_US",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang}>
      <head>
        {/* 기본 글꼴은 Apple SD Gothic Neo. Mac/iOS가 아닌 환경에서 깨지지 않도록 Noto Sans KR을 대체 글꼴로 불러옵니다. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
