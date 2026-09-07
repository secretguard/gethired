import type { MetadataRoute } from "next";

const BASE = "https://gethired.sarathg.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-07");
  return [
    { url: `${BASE}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/assessment`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/roadmap`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/screen`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/find-your-path`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/interview-prep`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/quiz`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/resources`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
