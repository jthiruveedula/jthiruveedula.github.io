import type { MetadataRoute } from "next";

const SITE_URL = "https://jthiruveedula.github.io";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
