import type { MetadataRoute } from "next";

import { SITE } from "@/content/social";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages: { en: SITE.url, es: `${SITE.url}/?lang=es` } },
    },
  ];
}
