import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

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

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({
    url: `${SITE_URL}${p || "/"}`,
    alternates: { languages: { ko: `${SITE_URL}${p || "/"}`, en: `${SITE_URL}/en${p}` } },
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p.startsWith("/services") ? 0.8 : 0.5,
  }));
}
