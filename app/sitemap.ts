import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listPublishedInsights } from "@/lib/insights";

export const revalidate = 3600;


const PATHS = [
  "",
  "/about",
  "/services/advirtual",
  "/services/shopping",
  "/services/to",
  "/apply/creator",
  "/apply/advertiser",
  "/apply/partner",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedInsights(200);
  const insights: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/insights`, changeFrequency: "daily", priority: 0.7, lastModified: posts[0]?.updated_at },
    ...posts.map((p) => ({
      url: `${SITE_URL}/insights/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
  const pages: MetadataRoute.Sitemap = PATHS.map((p) => ({
    url: `${SITE_URL}${p || "/"}`,
    alternates: { languages: { ko: `${SITE_URL}${p || "/"}`, en: `${SITE_URL}/en${p}` } },
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p.startsWith("/services") ? 0.8 : 0.5,
  }));
  return [...pages, ...insights];
}
