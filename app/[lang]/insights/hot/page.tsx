import type { Metadata } from "next";
import { KindListPage, kindMetadata } from "@/components/Insights";

export const revalidate = 300;
type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return lang === "ko" ? kindMetadata("hot") : {};
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <KindListPage lang={lang} kind="hot" />;
}
