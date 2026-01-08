import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const toolPaths = [
  "/tools/rut-validator",
  "/tools/json-master",
  "/tools/cron-predictor",
  "/tools/regex-lab",
  "/tools/hash-generator",
  "/tools/glassmorphism-gen",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
    },
    ...toolPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified,
    })),
  ];
}
