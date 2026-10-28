import type { Metadata } from "next";
import type { Lang } from "./forms";
import { pagePath, type PageSlug } from "./dictionary";

export function pageMetadata(lang: Lang, slug: PageSlug, meta: { title: string; description: string }): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: pagePath(lang, slug),
      languages: { ko: pagePath("ko", slug), en: pagePath("en", slug) },
    },
    openGraph: { title: meta.title, description: meta.description, type: "website" },
  };
}
