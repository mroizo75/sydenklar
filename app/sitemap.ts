import type { MetadataRoute } from "next";

const siteUrl = "https://www.sydenklar.no";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { url: siteUrl, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${siteUrl}/hoteller`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${siteUrl}/destinasjoner`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${siteUrl}/tilbud`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${siteUrl}/pakkereiser`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${siteUrl}/om-oss`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${siteUrl}/kontakt`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${siteUrl}/faq`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${siteUrl}/personvern`, priority: 0.3, changeFrequency: "monthly" as const },
    { url: `${siteUrl}/vilkar`, priority: 0.3, changeFrequency: "monthly" as const },
  ];

  return staticPages.map((page) => ({
    url: page.url,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
