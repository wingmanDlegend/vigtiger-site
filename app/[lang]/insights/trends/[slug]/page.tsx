import type { Metadata } from "next";
import { PostPage, postMetadata } from "@/components/Insights";

// 글은 빌드 때 만들지 않고 첫 방문 때 만들어 5분간 캐시합니다.
export const revalidate = 300;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  return postMetadata("trends", lang, slug);
}

export default async function Page({ params }: Props) {
  const { lang, slug } = await params;
  return <PostPage lang={lang} kind="trends" slug={slug} />;
}
